import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/crypto', async (req, res) => {
  try {
    const getCryptoData = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false')
    const data = getCryptoData.data
    const crypts = data.map((crypt) => {
      return {
        id: crypt.id,
        name: crypt.name,
        image: crypt.image,
        symbol: crypt.symbol,
        marketCap: crypt.market_cap,
        ranking: crypt.market_cap_rank,
        currentPrice: crypt.current_price,
        dailyRateChange: crypt.price_change_percentage_24h
      }
    })
    res.json(crypts)
  } catch (error) {
    console.error('fallo perrito')
  }
})

router.get('/:idCrypto', async (req, res) => {
  try {
    const id = req.params.idCrypto
    const date = new Date()
    const output = String(date.getDate()).padStart(2, '0') + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + date.getFullYear()
    const months = []
    const numberOfMonths = output.substring(4, 5)
    let i = 1
    while (i <= numberOfMonths) {
      months.push(i)
      i++
    }
    const getDetailsCrypto = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`)
    const mapA = months.map((e, i) => {
      const d = output.split('-')
      d[1] = String(e)
      const c = d.join('-')
      return axios.get(`https://api.coingecko.com/api/v3/coins/${id}/history?date=${c}`)
    })
    const a = await Promise.all(mapA)
    const ads = a.map(e => e.data.market_data.current_price.usd)

    const data = getDetailsCrypto.data
    const data2 = ads

    res.json({ data, data2 })
  } catch (error) {
    console.error('failed')
  }
})

router.get('/dolarblue', async (req, res) => {
  try {
    const getCurrData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/dolarblue')
    const data = await getCurrData.data
    const dolarBlue = {
      name: 'Dolar Blue',
      date: data.fecha,
      purchaseRate: data.venta,
      saleRate: data.compra
    }
    res.json(dolarBlue)
  } catch (error) {
    console.error(error)
  }
})

router.get('/riesgopais', async (req, res) => {
  try {
    const getRiskData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/riesgopais')
    const data = getRiskData.data
    const CountryRisk = {
      date: data.fecha,
      value: data.valor
    }
    res.json(CountryRisk)
  } catch (error) {
    console.error(error)
  }
})

router.get('/riesgopais', async (req, res) => {
  try {
    const getRiskData = await axios.get('https://api-dolar-argentina.herokuapp.com/api/riesgopais')
    const data = getRiskData.data
    const CountryRisk = {
      date: data.fecha,
      value: data.valor
    }
    res.json(CountryRisk)
  } catch (error) {
    console.error(error)
  }
})

export default router
