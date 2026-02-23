import Head from 'next/head';
import { withBasePath } from '../utils/basePath';

export default function Bilibili() {
    return (
        <div
            className="flex flex-col items-center justify-center bg-white p-6"
            style={{ height: '100dvh' }}
        >
            <Head><title>哔哩哔哩</title></Head>
            <div className="text-center max-w-xs w-full">
                {/* B站图标 */}
                <div className="w-16 h-16 bg-[#FC538A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-200/50">
                    <img
                        src={withBasePath('/icon-bilibili.svg')}
                        alt="哔哩哔哩"
                        className="w-10 h-10"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-white text-2xl font-bold">B</span>';
                        }}
                    />
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">关注我的哔哩哔哩</h2>

                {/* 二维码 */}
                <div className="mx-auto w-56 h-56 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 p-3 m-5">
                    <img
                        src={withBasePath('/qr-bilibili.png')}
                        alt="哔哩哔哩二维码"
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-gray-300 text-sm">二维码加载中...</span>';
                        }}
                    />
                </div>

                <p className="mb-6">或<a className="text-white bg-[#FC538A] box-border border border-transparent hover:bg-[#ff91b5] focus:ring-4 shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none m-5" href="https://b23.tv/bDGUQc5">直接打开哔哩哔哩</a></p>
            </div>
        </div >
    );
}
