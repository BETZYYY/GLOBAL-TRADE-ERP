const express = require('express')
const router = express.Router()

router.post('/optimize', async (req, res) => {
  const { negara_mitra, nilai_transaksi, 
          metode_pembayaran, durasi_preferensi } = req.body
  
  // Country risk scoring
  const countryRisk = {
    'Japan': { rating: 'A+', risk: 28, history: 'Excellent' },
    'Germany': { rating: 'A+', risk: 25, history: 'Excellent' },
    'United States': { rating: 'AA', risk: 20, history: 'Excellent' },
    'Singapore': { rating: 'AAA', risk: 15, history: 'Excellent' },
    'China': { rating: 'A-', risk: 45, history: 'Good' },
    'Indonesia': { rating: 'BBB', risk: 35, history: 'Good' },
  }
  
  const country = countryRisk[negara_mitra] || 
    { rating: 'B+', risk: 55, history: 'Fair' }
  
  const recommendations = [
    {
      tenor: 'Net 30',
      metode: metode_pembayaran || 'LC',
      risk_score: country.risk,
      cash_flow_impact: '+$2,100 saved',
      default_probability: (country.risk * 0.08).toFixed(1) + '%',
      recommended: true,
      reason: `${negara_mitra} shows stable payment behavior.`
    },
    {
      tenor: 'Net 60',
      metode: 'Open Account',
      risk_score: country.risk + 13,
      cash_flow_impact: '-$800 cost',
      default_probability: ((country.risk + 13) * 0.08).toFixed(1) + '%',
      recommended: false
    },
    {
      tenor: 'Net 90',
      metode: 'Documentary Collection',
      risk_score: country.risk + 27,
      cash_flow_impact: '-$2,400 cost',
      default_probability: ((country.risk + 27) * 0.08).toFixed(1) + '%',
      recommended: false
    }
  ]
  
  res.json({
    success: true,
    data: {
      recommendations,
      country_profile: {
        rating: country.rating,
        payment_history: country.history,
        currency_stability: 'Low Volatility'
      }
    }
  })
})

module.exports = router
