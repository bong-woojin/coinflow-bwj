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

export type UpbitStreamType = 'SNAPSHOT' | 'REALTIME'

export type UpbitSocketTicker = {
    type: 'ticker'
    stream_type: UpbitStreamType
    code: string
    prev_closing_price: number
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

export type UpbitSocketTrade = {
    type: 'trade'
    stream_type: UpbitStreamType
    code: string
    sequential_id: string           // 17자리라 parseUpbitJson에서 문자열로 변환됨
    trade_price: number
    trade_volume: number
    ask_bid: 'ASK' | 'BID'
    prev_closing_price: number
    trade_timestamp: number
}

export type UpbitSocketMessage = UpbitSocketTicker | UpbitSocketTrade

// 시세가 아닌 응답 — PING에 대한 {"status":"UP"}, 요청 오류 {"error":{...}}
export type UpbitSocketNotice = {
    status?: string
    error?: { name: string; message: string }
}

export type Trade = {
    id: string
    price: number
    volume: number
    askBid: 'ASK' | 'BID'
    timestamp: number
}