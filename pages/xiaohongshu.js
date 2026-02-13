import Head from 'next/head';

export default function Xiaohongshu() {
    return (
        <div
            className="flex flex-col items-center justify-center bg-white p-6"
            style={{ height: '100dvh' }}
        >
            <Head><title>小红书</title></Head>
            <div className="text-center max-w-xs w-full">
                {/* 小红书图标 */}
                <div className="w-16 h-16 bg-[#FF2442] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-200/50">
                    <img
                        src="/icon-rednote.svg"
                        alt="小红书"
                        className="w-10 h-10"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-white text-2xl font-bold">红</span>';
                        }}
                    />
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">关注我的小红书</h2>

                {/* 二维码 */}
                <div className="mx-auto w-56 h-56 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 p-3 m-5">
                    <img
                        src="/qr-xiaohongshu.png"
                        alt="小红书二维码"
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-gray-300 text-sm">二维码加载中...</span>';
                        }}
                    />
                </div>
                <p className="mb-6">或<a className="text-white bg-[#FF2442] box-border border border-transparent hover:bg-[#ff8e9d] focus:ring-4 shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none m-5" href="https://xhslink.com/m/1QuuT5HO95z">直接打开小红书</a></p>
            </div>
        </div>
    );
}
