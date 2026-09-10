<template>
  <UiLayout title="简历">
    <!-- 会话回放 -->
    <div
      class="term-scan space-y-6 font-mono text-[13px] leading-6 text-zinc-600 tabular-nums dark:text-zinc-300"
    >
      <!-- 命令行：窄屏放不下整行时命令整体换行，提示符名字始终可见 -->
      <p class="flex flex-wrap items-baseline gap-x-1.5">
        <span class="font-semibold text-green-600 dark:text-green-400"
          >{{ basics.host }}@world<span class="text-zinc-400 dark:text-zinc-500"
            >:~</span
          ></span
        >
        <span class="text-zinc-400 dark:text-zinc-500">$</span>
        <span
          class="font-semibold whitespace-nowrap text-zinc-800 dark:text-zinc-100"
        >
          <span class="term-type" :style="{ '--term-steps': command.length }">{{
            command
          }}</span
          ><span
            class="term-cursor inline-block h-3.5 w-1.5 translate-y-[2px] bg-blue-500 dark:bg-blue-400"
          ></span>
        </span>
      </p>

      <!-- 读取档案 -->
      <section>
        <p
          class="term-step flex items-baseline gap-2.5 whitespace-nowrap"
          style="animation-delay: 0.3s"
        >
          <span
            class="-ml-px h-2 w-2 shrink-0 self-center rounded-full bg-current text-blue-500 dark:text-blue-400"
          ></span>
          <span class="min-w-0 flex-1 truncate">
            <span class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
              >Read</span
            ><span class="text-zinc-500 dark:text-zinc-400">(ltt.profile)</span>
          </span>
          <span
            class="hidden shrink-0 text-xs text-zinc-400 sm:inline dark:text-zinc-500"
            >8 lines · 0.1s</span
          >
        </p>

        <div class="term-step mt-2.5" style="animation-delay: 0.45s">
          <div class="relative">
            <!-- 边框与偏移衬块都置于容器：img 的 grayscale 滤镜会连带去色；
                 衬块用硬阴影实现（绘制于边框外侧，不遮挡边框） -->
            <div
              class="relative mt-1 mb-5 ml-4 w-fit rounded-lg border border-zinc-400 shadow-[10px_10px_0_0_#e4e4e7b3] md:absolute md:top-1.5 md:right-2.5 md:mt-0 md:mb-0 md:ml-0 dark:border-zinc-500 dark:shadow-[10px_10px_0_0_#52525b80] print:absolute print:top-1.5 print:right-2.5 print:m-0"
            >
              <img
                src="/images/me.webp"
                :alt="`${name}头像`"
                class="relative block h-24 w-24 rounded-[7px] object-cover grayscale transition-all duration-300 hover:grayscale-0"
              />
            </div>

            <div
              class="grid grid-cols-[3.5rem_1fr] gap-x-2 gap-y-1 pl-4 md:pr-[7.5rem] print:pr-[7.5rem]"
            >
              <span class="text-zinc-400 dark:text-zinc-500">姓名</span>
              <span class="font-bold text-zinc-800 dark:text-zinc-100">
                {{ name }}
              </span>
              <span class="text-zinc-400 dark:text-zinc-500">意向</span>
              <span>{{ basics.intention }}</span>
              <span class="text-zinc-400 dark:text-zinc-500">背景</span>
              <!-- 性别/籍贯仅线上展示：打印/导出 PDF 的投递版省略，减少无关筛选因素 -->
              <span>
                <span v-if="basics.gender" class="print:hidden"
                  >{{ basics.gender }} · </span
                >{{ currentAge }} 岁<template v-if="basics.hometown"
                  ><span class="print:hidden">
                    · {{ basics.hometown }}</span
                  ></template
                ></span
              >
              <span class="text-zinc-400 dark:text-zinc-500">教育</span>
              <span>{{ basics.degree }} · {{ basics.school }}</span>
              <span class="text-zinc-400 dark:text-zinc-500">联系</span>
              <span class="flex flex-wrap gap-x-3">
                <a
                  :href="`mailto:${email}`"
                  class="underline-offset-2 transition-colors hover:underline"
                  >{{ email }}</a
                >
                <span class="text-zinc-400 dark:text-zinc-500">·</span>
                <!-- 手机号默认掩码防爬虫，点击展开；打印/导出 PDF 投递时直接呈现完整号码 -->
                <button
                  v-if="!showPhone"
                  type="button"
                  class="cursor-pointer underline-offset-2 transition-colors hover:underline print:hidden"
                  @click="showPhone = true"
                >
                  {{ maskedPhone }}
                </button>
                <a
                  v-else
                  :href="`tel:${basics.phone}`"
                  class="underline-offset-2 transition-colors hover:underline print:hidden"
                  >{{ basics.phone }}</a
                >
                <span class="hidden print:inline">{{ basics.phone }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 评估优势 -->
      <section>
        <p
          class="term-step flex items-baseline gap-2.5 whitespace-nowrap"
          style="animation-delay: 0.55s"
        >
          <span
            class="-ml-px h-2 w-2 shrink-0 self-center rounded-full bg-current text-blue-500 dark:text-blue-400"
          ></span>
          <span class="min-w-0 flex-1 truncate">
            <span class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
              >Analyze</span
            ><span class="text-zinc-500 dark:text-zinc-400">(strengths)</span>
          </span>
          <span
            class="hidden shrink-0 text-xs text-zinc-400 sm:inline dark:text-zinc-500"
            >{{ strengths.length }} items · 0.3s</span
          >
        </p>

        <div
          class="term-rail term-step mt-2.5 space-y-2.5"
          style="animation-delay: 0.65s"
        >
          <div
            v-for="(item, i) in strengths"
            :key="item.tag"
            class="term-row term-step pr-2 pl-4"
            :style="{ animationDelay: `${0.65 + i * 0.08}s` }"
          >
            <span class="term-dot text-green-500"></span>
            <p class="min-w-0 text-justify">
              <span
                class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
                >{{ item.tag }}</span
              ><span v-html="highlight(item.text)"></span>
            </p>
          </div>
        </div>
      </section>

      <!-- 作品列表 -->
      <section>
        <p
          class="term-step flex items-baseline gap-2.5 whitespace-nowrap"
          :style="{ animationDelay: at(worksTitleAt) }"
        >
          <span
            class="-ml-px h-2 w-2 shrink-0 self-center rounded-full bg-current text-blue-500 dark:text-blue-400"
          ></span>
          <span class="min-w-0 flex-1 truncate">
            <span class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
              >Bash</span
            ><span class="text-zinc-500 dark:text-zinc-400">(ls works/)</span>
          </span>
          <span
            class="hidden shrink-0 text-xs text-zinc-400 sm:inline dark:text-zinc-500"
            >{{ (basics.links ?? []).length }} items · 0.4s</span
          >
        </p>

        <div
          class="term-rail term-step mt-2.5 space-y-2"
          :style="{ animationDelay: at(worksAt) }"
        >
          <a
            v-for="(link, i) in basics.links ?? []"
            :key="link.url"
            :href="withProtocol(link.url)"
            target="_blank"
            class="term-step relative block py-1 pr-2 pl-4"
            :style="{ animationDelay: at(worksAt + 0.08 + i * 0.1) }"
          >
            <span class="term-dot text-blue-500 dark:text-blue-400"></span>
            <span
              class="group inline-flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <i
                :class="link.icon || 'ri-link'"
                class="text-[11px] leading-none text-zinc-400 dark:text-zinc-500"
              ></i>
              {{ prettyUrl(link.url) }}
            </span>
          </a>
        </div>
      </section>

      <!-- 工作经历 -->
      <section>
        <p
          class="term-step flex items-baseline gap-2.5 whitespace-nowrap"
          :style="{ animationDelay: at(jobsTitleAt) }"
        >
          <span
            class="-ml-px h-2 w-2 shrink-0 self-center rounded-full bg-current text-blue-500 dark:text-blue-400"
          ></span>
          <span class="min-w-0 flex-1 truncate">
            <span class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
              >Bash</span
            ><span class="text-zinc-500 dark:text-zinc-400"
              >(history --work)</span
            >
          </span>
          <span
            class="hidden shrink-0 text-xs text-zinc-400 sm:inline dark:text-zinc-500"
            >{{ jobs.length }} entries · 0.6s</span
          >
        </p>

        <div
          class="term-rail term-step mt-2.5 space-y-5"
          :style="{ animationDelay: at(jobsAt) }"
        >
          <div
            v-for="(job, j) in jobs"
            :key="job.company"
            class="term-step relative py-1 pl-4"
            :style="{ animationDelay: at(jobsAt + j * 0.15) }"
          >
            <span class="term-dot text-blue-500 dark:text-blue-400"></span>
            <div class="flex flex-wrap items-baseline gap-x-3">
              <span class="font-semibold text-zinc-800 dark:text-zinc-100">
                {{ job.company }}
              </span>
              <span
                class="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
              >
                {{ job.role }}
              </span>
              <span class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                {{ job.period }}
              </span>
            </div>

            <div class="mt-1.5 space-y-1.5">
              <p
                v-for="duty in job.duties"
                :key="duty"
                class="py-0.5 pr-2 text-justify"
                v-html="highlight(duty)"
              ></p>
            </div>
          </div>
        </div>
      </section>

      <!-- 其他经历 -->
      <section>
        <p
          class="term-step flex items-baseline gap-2.5 whitespace-nowrap"
          :style="{ animationDelay: at(achTitleAt) }"
        >
          <span
            class="-ml-px h-2 w-2 shrink-0 self-center rounded-full bg-current text-blue-500 dark:text-blue-400"
          ></span>
          <span class="min-w-0 flex-1 truncate">
            <span class="mr-2 font-semibold text-zinc-800 dark:text-zinc-100"
              >Bash</span
            ><span class="text-zinc-500 dark:text-zinc-400"
              >(ls -lt achievements/)</span
            >
          </span>
          <span
            class="hidden shrink-0 text-xs text-zinc-400 sm:inline dark:text-zinc-500"
            >total {{ achievements.length }} · 0.2s</span
          >
        </p>

        <div
          class="term-rail term-step mt-2.5"
          :style="{ animationDelay: at(achTotalAt) }"
        >
          <p
            class="term-step pl-4 text-xs text-zinc-400 dark:text-zinc-500"
            :style="{ animationDelay: at(achTotalAt) }"
          >
            total {{ achievements.length }}
          </p>

          <div class="mt-2 space-y-2.5">
            <p
              v-for="(item, i) in achievements"
              :key="item.text"
              class="term-row term-step pr-2 pl-4 text-justify"
              :style="{ animationDelay: at(achAt + i * 0.07) }"
            >
              <span class="term-dot text-blue-500 dark:text-blue-400"></span>
              <span class="mr-1.5 text-xs text-zinc-400 dark:text-zinc-500"
                >{{ item.period }} ·</span
              ><span v-html="highlight(item.text)"></span>
            </p>
          </div>
        </div>
      </section>

      <!-- 完成统计：轻量会话收尾 -->
      <p
        class="term-hr term-step flex items-center gap-2.5 text-xs text-zinc-400 dark:text-zinc-500"
        :style="{ animationDelay: at(summaryAt) }"
      >
        <i class="ri-check-line text-green-500"></i>
        <span
          >简历就绪 · {{ strengths.length }} 项优势 ·
          {{ (basics.links ?? []).length }} 个作品 · {{ jobs.length }} 段经历 ·
          {{ achievements.length }} 项荣誉</span
        >
      </p>
    </div>
  </UiLayout>
</template>

<script setup>
const { currentAge } = useProfile()
const {
  public: { name, email },
} = useRuntimeConfig()

// 命令文本：字符数经 --term-steps 驱动下方样式中 term-type 的打字步数
const command = 'agent profile --inspect'

// 数据优先级：本机 data/resume.local.js（已 gitignore，便于本地修改预览）→ 云端 Supabase → 内置示例兜底；
// glob 仅匹配实际存在的文件，local 缺失时自动跳过；local 改好后执行 npm run resume:push 同步云端
const resumeFiles = import.meta.glob('../data/resume.*.js')

// 数据结构缺失时整体回退而非渲染报错
const isResume = (data) =>
  data?.basics?.host &&
  Array.isArray(data.strengths) &&
  Array.isArray(data.jobs) &&
  Array.isArray(data.achievements)

const localResume =
  resumeFiles['../data/resume.local.js'] &&
  (await resumeFiles['../data/resume.local.js']()).default

const { data: cloudResume } = await useAsyncData('resume', () =>
  $fetch('/api/resume').catch(() => null),
)
const candidates = [
  localResume,
  toValue(cloudResume),
  (await resumeFiles['../data/resume.example.js']()).default,
]
const { basics, strengths, jobs, achievements } = candidates.find(isResume)

// 手机号防爬虫：线上默认掩码展示，点击展开为 tel 链接；打印时直接完整呈现
const showPhone = ref(false)
const maskedPhone = computed(() =>
  basics.phone
    ? `${basics.phone.slice(0, 3)}****${basics.phone.slice(-4)}`
    : '',
)

// 链接兜底：url 缺协议头时补 https，避免被解析为站内相对路径
const withProtocol = (url) =>
  /^https?:\/\//.test(url) ? url : `https://${url}`
const prettyUrl = (url) => url.replace(/^https?:\/\//, '')

// 转义 HTML 后将 [[内容]] 标记渲染为加粗高亮，突出关键成果数字或条目小标题
const escapeHtml = (str) =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const highlight = (text) =>
  escapeHtml(text).replace(
    /\[\[(.+?)\]\]/g,
    '<span class="font-semibold text-zinc-800 dark:text-zinc-100">$1</span>',
  )

// 会话回放节奏：后续区块入场时刻依实际条数推算，条数变化时保持顺序连贯
const at = (t) => `${Math.round(t * 100) / 100}s`
const worksTitleAt = 0.65 + strengths.length * 0.08 + 0.15
const worksAt = worksTitleAt + 0.08
const jobsTitleAt = worksAt + (basics.links?.length ?? 0) * 0.1 + 0.15
const jobsAt = jobsTitleAt + 0.08
const achTitleAt = jobsAt + jobs.length * 0.15 + 0.2
const achTotalAt = achTitleAt + 0.08
const achAt = achTitleAt + 0.15
const summaryAt = achAt + achievements.length * 0.07 + 0.25

useSeoMeta({
  title: '简历',
  description: `${name}的简历，${basics.intention}。`,
  // 不入搜索引擎索引：链接可直接打开，但不要被抓取收录
  robots: 'noindex, nofollow, noarchive',
})
</script>

<style scoped>
/* 终端结果轨道：渐隐竖线，配合节点圆点形成时间线结构 */
.term-rail {
  position: relative;
}

.term-rail::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 0;
  left: 2.5px;
  width: 1px;
  background: linear-gradient(
    to bottom,
    var(--color-zinc-300),
    var(--color-zinc-300) 60%,
    transparent
  );
}

/* 轨道节点：叠在竖线上的空心圆环，不透明底遮住竖线（中心 x=3 与标题圆点同轴） */
.term-dot {
  position: absolute;
  top: 12px;
  left: -1px;
  width: 8px;
  height: 8px;
  border: 1.5px solid currentColor;
  border-radius: 9999px;
  background: #fff;
}

/* 条目行 */
.term-row {
  position: relative;
  padding-block: 0.25rem;
}

/* 终端扫描线纹理与选中色：极淡横向线条，经蒙版两端渐隐，营造 CRT 质感 */
.term-scan {
  position: relative;
}

.term-scan::selection {
  background: rgb(59 130 246 / 0.25);
}

.term-scan::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0 3px,
    rgb(0 0 0 / 0.015) 3px 4px
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    #000 12%,
    #000 88%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    #000 12%,
    #000 88%,
    transparent
  );
}

/* 横向渐隐分隔线：两端透明 */
.term-hr {
  background-image: linear-gradient(
    to right,
    transparent,
    rgb(228 228 231 / 0.9) 20%,
    rgb(228 228 231 / 0.9) 80%,
    transparent
  );
  background-repeat: no-repeat;
  background-size: 100% 1px;
  background-position: 0 0;
  padding-top: 1rem;
}

@media (prefers-color-scheme: dark) {
  .term-rail::before {
    background: linear-gradient(
      to bottom,
      var(--color-zinc-600),
      var(--color-zinc-600) 60%,
      transparent
    );
  }

  .term-dot {
    background: rgb(39 39 42);
  }

  .term-scan::before {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0 3px,
      rgb(255 255 255 / 0.025) 3px 4px
    );
  }

  .term-scan::selection {
    background: rgb(96 165 250 / 0.3);
  }

  .term-hr {
    background-image: linear-gradient(
      to right,
      transparent,
      rgb(63 63 70 / 0.8) 20%,
      rgb(63 63 70 / 0.8) 80%,
      transparent
    );
  }
}

/* 会话块依次入场，回放 Agent 执行过程 */
@media (prefers-reduced-motion: no-preference) {
  .term-step {
    opacity: 0;
    animation: term-step-in 0.32s ease forwards;
  }

  @keyframes term-step-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 命令行逐字打字回放，步数 = 命令字符数，由页面注入 --term-steps */
  .term-type {
    clip-path: inset(-0.2em 100% -0.2em 0);
    animation: term-type 0.7s steps(var(--term-steps, 23), end) 0.1s forwards;
  }

  @keyframes term-type {
    to {
      clip-path: inset(-0.2em 0 -0.2em 0);
    }
  }

  /* 终端块状光标闪烁 */
  .term-cursor {
    animation: term-blink 1.1s step-end infinite;
  }

  @keyframes term-blink {
    50% {
      opacity: 0;
    }
  }
}

/* 打印兜底：入场态依赖屏幕动画填充，打印/导出 PDF 时直接呈现最终态，避免整页空白；
   打印默认丢弃背景图形，而终端线条（轨道竖线/分隔线/纹理/色块）均为背景绘制，exact 强制原样输出 */
@media print {
  .term-scan {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .term-step {
    opacity: 1;
    animation: none;
  }

  .term-type {
    clip-path: none;
    animation: none;
  }

  .term-cursor {
    animation: none;
  }
}
</style>
