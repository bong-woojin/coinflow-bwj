import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from "./layouts/AppLayout.tsx";
import Home from "./pages/Home.tsx";
import CoinDetail from "./pages/CoinDetail.tsx";

export default function App() {
    return (
        <BrowserRouter>        {/* 고정 */}
            <Routes>             {/* 고정 */}
                <Route element={<AppLayout />}>              {/* 레이아웃 쓸 때만 */}
                    <Route path="/" element={<Home />} />                    {/* ← 여기만 */}
                    <Route path="/coins/:market" element={<CoinDetail />} /> {/* ← 여기만 */}
                </Route>
            </Routes>
        </BrowserRouter>
    )
}