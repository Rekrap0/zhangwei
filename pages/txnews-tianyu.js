import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';
import { IoMdArrowBack } from 'react-icons/io';
import { withBasePath } from '../utils/basePath';

export default function TxNewsTianyu() {
    const router = useRouter();

    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (!playerName || !startDate) {
            router.replace('/');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Head><title>疼讯新闻</title></Head>
            {/* 顶部栏 */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center h-12 px-4">
                    <button
                        onClick={() => router.back()}
                        className="p-1 -ml-1 mr-3"
                    >
                        <IoMdArrowBack className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">讯</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">疼讯新闻</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                </div>
            </header>

            {/* 文章内容 */}
            <main className="flex-1 overflow-y-auto">
                {/* 封面图 */}
                <div className="w-full h-52 bg-gray-100 overflow-hidden">
                    <img
                        src={withBasePath('/newsTianyu.png')}
                        alt="新闻配图"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"><span class="text-gray-400 text-sm">图片</span></div>';
                        }}
                    />
                </div>

                {/* 标题区 */}
                <div className="px-5 pt-5 pb-3">
                    <h1 className="text-xl font-bold text-gray-900 leading-snug">
                        父爱如磐，静待花开——恒念药业董事长田宇与女儿的渐冻症抗争之路
                    </h1>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span>疼讯新闻</span>
                        <span>·</span>
                        <span>2026-01-18 09:32</span>
                        <span className="ml-auto flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            12.4万
                        </span>
                    </div>
                </div>

                <hr className="border-gray-100 mx-5" />

                {/* 正文 */}
                <article className="px-5 py-4 text-[15px] text-gray-800 leading-[1.9] space-y-5">
                    <p className="font-bold text-gray-600 text-sm">本报讯</p>

                    <p>
                        旋转木马的鎏金栏杆还在记忆里流转，田宇的掌心却早已习惯了另一种温度——那是女儿田念安日渐冰凉的指尖，也是他与渐冻症对抗三年来，从未松开的希望。
                    </p>

                    <p>
                        作为恒念药业的掌舵人，田宇曾是资本市场上叱咤风云的人物，而如今，他的身份只有一个：一位守护女儿的父亲。三年前，10岁的田念安被确诊为渐冻症，这个被称为&ldquo;渐冻人症&rdquo;的罕见病，像一场无声的冰雪，慢慢冻结了女孩的肢体，也冻结了田宇的世界。
                    </p>

                    <p>
                        &ldquo;那天在游乐园，她还抓着我的手喊&lsquo;爸爸再玩一次&rsquo;，可现在，她连抬手的力气都没有了。&rdquo;田宇坐在豪华单人病房的床边，目光落在女儿苍白的脸上，声音里藏着难以言说的痛楚。
                    </p>

                    <p>
                        渐冻症全球尚无根治药物，但田宇没有放弃。他暂停恒念药业所有非核心项目，将超百亿元研发资金全部投入渐冻症药物研究，只为给女儿和全球数十万患者寻找一线生机。这一决定遭到董事会强烈反对，市场质疑其&ldquo;用商业帝国赌医学奇迹&rdquo;，但田宇始终坚定：&ldquo;我是恒念的董事长，但我更是念安的爸爸。&rdquo;
                    </p>

                    <p>
                        此后的一千多个日夜，田宇把办公室搬到研发中心，与科研人员同吃同住，亲自参与实验设计，熬夜分析数据。尽管目前新药尚未研制成功，但每一次实验数据的突破，都让他离希望更近一步。
                    </p>

                    <p>
                        &ldquo;我知道这条路很难，但我不能让女儿独自面对这场冰雪。&rdquo;田宇说，&ldquo;我会一直等，等医学的进步，等奇迹的出现，也等她重新站起来，再和我一起去坐一次旋转木马。&rdquo;
                    </p>

                    <p>
                        如今，田念安的病情虽未得到根治，但在田宇的悉心照料和医学团队的努力下，病情发展已得到有效延缓。在他的办公室里，那张旋转木马的照片始终摆在最显眼的位置，一边是过往的温暖，一边是未来的期盼。
                    </p>

                    <p>
                        &ldquo;父爱不是软肋，而是铠甲。&rdquo;田宇说，&ldquo;我会带着这份铠甲，一直走下去。&rdquo;
                    </p>
                </article>

                {/* 标签 */}
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#恒念药业</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#田宇</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#渐冻症</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">#企业家精神</span>
                </div>

                <hr className="border-gray-100 mx-5" />

                {/* 互动区 */}
                <div className="px-5 py-4 flex items-center justify-around text-gray-400 text-xs">
                    <button className="flex flex-col items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>2.1万</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>3,842</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>收藏</span>
                    </button>
                    <button className="flex flex-col items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>分享</span>
                    </button>
                </div>

                {/* 推荐阅读 */}
                <div className="bg-gray-50 px-5 py-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">推荐阅读</h3>
                    <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="text-sm text-gray-900 font-medium leading-snug">渐冻症研究新进展：干细胞疗法临床试验初步结果积极</h4>
                            <p className="text-xs text-gray-400 mt-1">疼讯新闻 · 2026-01-12</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="text-sm text-gray-900 font-medium leading-snug">恒念药业2025年度报告出炉：研发投入再创新高</h4>
                            <p className="text-xs text-gray-400 mt-1">疼讯新闻 · 2025-12-30</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
