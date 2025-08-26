import { factories } from '@strapi/strapi'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_KEY as string, { apiVersion: '2025-07-30.basil' })

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    try {
      const body = ctx.request.body as {
        products?: Array<{
          id?: any
          productId?: any
          documentId?: string
          sku?: string
          product?: { id?: any; documentId?: string; sku?: string }
          quantity?: number
        }>
      }

      const rawProducts = body?.products ?? []
      if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
        ctx.status = 400
        ctx.body = { error: 'No se enviaron productos.' }
        return
      }

      // Intenta encontrar el producto por id, documentId o sku
      const resolveProduct = async (p: any, idx: number) => {
        const cand = {
          id: p?.id ?? p?.productId ?? p?.product?.id,
          documentId: p?.documentId ?? p?.product?.documentId,
          sku: p?.sku ?? p?.product?.sku,
        }

        let item: any = null

        if (cand.id && Number.isFinite(Number(cand.id))) {
          item = await strapi.entityService
            .findOne('api::product.product', Number(cand.id), { populate: '*' })
            .catch(() => null)
        }

        if (!item && cand.documentId) {
  const r = await strapi.entityService.findMany('api::product.product', {
    filters: { documentId: cand.documentId } as any, // 👈 cast
    populate: '*',
    limit: 1,
  })
  item = Array.isArray(r) ? r[0] : r?.[0]
}


        if (!item && cand.sku) {
          const r = await strapi.entityService.findMany('api::product.product', {
            filters: { sku: cand.sku },
            populate: '*',
          })
          item = r?.[0] ?? null
        }

        if (!item) throw new Error(`Producto no encontrado (idx ${idx}). Enviado=${JSON.stringify(cand)}`)
        return item
      }

      const lineItems = await Promise.all(
        rawProducts.map(async (p, idx) => {
          const item = await resolveProduct(p, idx)

          const rawPrice = item?.price ?? item?.precio
          const name = item?.name ?? item?.nombre ?? item?.title ?? item?.sku ?? `Producto ${item?.id}`

          const unitAmount = Math.round(Number(rawPrice) * 100)
          if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
            throw new Error(`Precio inválido para ${name} (id=${item?.id}). rawPrice=${rawPrice}`)
          }

          return {
            price_data: {
              currency: 'MXN',
              product_data: { name },
              unit_amount: unitAmount,
            },
            quantity: p?.quantity ?? 1,
          }
        })
      )

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        shipping_address_collection: { allowed_countries: ['MX'] },
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/successError`,
        line_items: lineItems,
      })

      await strapi.service('api::order.order').create({
        data: { products: rawProducts, stripeId: session.id },
      })

      ctx.body = { stripeSession: session }
    } catch (err: any) {
      strapi.log.error('ERROR /api/orders:', { message: err?.message, stack: err?.stack })
      ctx.status = 400
      ctx.body = { error: 'No se pudo crear la sesión de pago', detail: err?.message }
    }
  },
}))
