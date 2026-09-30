export type Ticker = {
    market: string
    koreanName: string
    tradePrice: number
    changeRate: number
    accTradePrice24h: number
    highPrice: number
    lowPrice: number
    accTradeVolume24h: number
}

export type UpbitMarket = {
    market: string
    korean_name: string
    english_name: string
}

export type UpbitTicker = {
    market: string
    trade_price: number
    signed_change_rate: number
    signed_change_price: number
    high_price: number
    low_price: number
    opening_price: number
    prev_closing_price: number
    highest_52_week_price: number
    highest_52_week_date: string   // YYYY-MM-DD
    lowest_52_week_price: number
    lowest_52_week_date: string
    acc_trade_price_24h: number
    acc_trade_volume_24h: number
}

export type UpbitSocketTicker = {
    code: string
    trade_price: number
    signed_change_rate: number
    signed_change_price: number
    high_price: number
    low_price: number
    acc_trade_price_24h: number
    acc_trade_volume_24h: number
    acc_bid_volume: number          // 누적 매수 체결량 (UTC 0시 = KST 09시부터)
    acc_ask_volume: number          // 누적 매도 체결량 (UTC 0시 = KST 09시부터)
    highest_52_week_price: number
    lowest_52_week_price: number
}

export type Trade = {
    id: string
    price: number
    volume: number
    askBid: 'ASK' | 'BID'
    timestamp: number
}