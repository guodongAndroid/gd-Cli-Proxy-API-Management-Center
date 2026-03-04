<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-3xl font-bold tracking-tight">总览</h2>
      <div class="flex items-center gap-3">
        <span class="text-xs text-muted-foreground">自动刷新 {{ autoRefreshCountdownLabel }}</span>
        <Button @click="refreshData" :disabled="dashboardRefreshing" size="sm">
          <RefreshCw :class="['mr-2 h-4 w-4', dashboardRefreshing && 'animate-spin']" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- Top Summary Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card
        class="cursor-pointer border-border/80 bg-muted/35 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabindex="0"
        role="button"
        @click="handleTopCardClick('keys')"
        @keydown.enter.prevent="handleTopCardClick('keys')"
        @keydown.space.prevent="handleTopCardClick('keys')"
      >
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-background/80 p-3 text-muted-foreground">
              <KeyRound class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <div class="text-4xl font-bold leading-none">{{ formatNumber(topSummary.managementKeys) }}</div>
              <div class="text-base font-semibold leading-none">管理密钥</div>
              <p class="text-xs text-muted-foreground">配置面板</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer border-border/80 bg-muted/35 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabindex="0"
        role="button"
        @click="handleTopCardClick('providers')"
        @keydown.enter.prevent="handleTopCardClick('providers')"
        @keydown.space.prevent="handleTopCardClick('providers')"
      >
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-background/80 p-3 text-muted-foreground">
              <Bot class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <div class="text-4xl font-bold leading-none">{{ formatNumber(topSummary.providers.total) }}</div>
              <div class="text-base font-semibold leading-none">AI 提供商</div>
              <p class="text-xs text-muted-foreground">{{ providerBreakdownText }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer border-border/80 bg-muted/35 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabindex="0"
        role="button"
        @click="handleTopCardClick('files')"
        @keydown.enter.prevent="handleTopCardClick('files')"
        @keydown.space.prevent="handleTopCardClick('files')"
      >
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-background/80 p-3 text-muted-foreground">
              <FileText class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <div class="text-4xl font-bold leading-none">{{ formatNumber(topSummary.authFiles) }}</div>
              <div class="text-base font-semibold leading-none">认证文件</div>
              <p class="text-xs text-muted-foreground">OAuth 凭证</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer border-border/80 bg-muted/35 transition-colors hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabindex="0"
        role="button"
        @click="handleTopCardClick('models')"
        @keydown.enter.prevent="handleTopCardClick('models')"
        @keydown.space.prevent="handleTopCardClick('models')"
      >
        <CardContent class="p-5">
          <div class="flex items-start gap-4">
            <div class="rounded-lg bg-background/80 p-3 text-muted-foreground">
              <Package class="h-5 w-5" />
            </div>
            <div class="space-y-1">
              <div class="text-4xl font-bold leading-none">{{ formatNumber(topSummaryAvailableModels) }}</div>
              <div class="text-base font-semibold leading-none">可用模型</div>
              <p class="text-xs text-muted-foreground">所有提供的模型总数</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Total Requests Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">总请求数</CardTitle>
          <Badge variant="secondary" class="text-xs">Total</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatNumber(globalStats?.totalRequests || 0) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            所有 API 调用，最近24小时: {{ formatNumber(last24hRequests) }}
          </p>
        </CardContent>
      </Card>

      <!-- Success Rate Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">成功率</CardTitle>
          <Badge :variant="successRateBadgeVariant" class="text-xs">
            {{ globalStats?.successRate || 0 }}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold" :class="successRateColorClass">
            {{ globalStats?.successRate || '0.00' }}%
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            成功: {{ formatNumber(globalStats?.successCount || 0) }} / 失败: {{ formatNumber(globalStats?.failureCount || 0) }}
          </p>
        </CardContent>
      </Card>

      <!-- Avg Tokens Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">平均 Tokens/请求</CardTitle>
          <Badge variant="secondary" class="text-xs">Avg</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatTokens(avgTokensPerRequest) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            基于总请求与总 Tokens
          </p>
        </CardContent>
      </Card>

      <!-- Total Tokens Card -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">总 Token 消耗</CardTitle>
          <Badge variant="outline" class="text-xs">Tokens</Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatTokens(globalStats?.totalTokens || 0) }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            最近24小时: {{ formatTokens(last24hTokens) }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid gap-4">
      <Card>
        <CardContent class="pt-6">
          <ServiceHealthMonitor
            :points="serviceHealthPoints"
            window-label="最近 7 天 · 每15分钟"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="space-y-3">
          <CardTitle>Token类型分布</CardTitle>
          <div class="flex flex-wrap items-center gap-3">
            <div
              v-for="item in tokenTypeLegendItems"
              :key="item.name"
              class="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span class="h-[2px] w-5 rounded-full" :style="{ backgroundColor: item.color }" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pt-2">
          <UsageChart
            :x-axis-data="tokenTypeHourDistribution.dates"
            :series="tokenTypeHourDistribution.series"
            type="line"
            :y-axis="[{ name: 'Tokens' }]"
          />
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>请求趋势</CardTitle>
        </CardHeader>
        <CardContent class="pt-2">
          <UsageChart
            :x-axis-data="requestTrendChart.dates"
            :series="requestTrendChart.series"
            type="line"
            :y-axis="[{ name: '请求数' }]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token使用趋势</CardTitle>
        </CardHeader>
        <CardContent class="pt-2">
          <UsageChart
            :x-axis-data="tokenUsageTrendChart.dates"
            :series="tokenUsageTrendChart.series"
            type="line"
            :y-axis="[{ name: 'Tokens' }]"
          />
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Top API</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div v-if="topApis.length === 0" class="text-sm text-muted-foreground">
            暂无数据
          </div>
          <div
            v-for="(api, index) in topApis"
            :key="api.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="text-[10px]">#{{ index + 1 }}</Badge>
              <span class="font-medium">{{ maskApiName(api.name) }}</span>
            </div>
            <div class="text-muted-foreground">
              {{ formatNumber(api.requests) }} 次 · {{ formatTokens(api.tokens) }} tokens
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 模型</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div v-if="topModels.length === 0" class="text-sm text-muted-foreground">
            暂无数据
          </div>
          <div
            v-for="(model, index) in topModels"
            :key="model.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="text-[10px]">#{{ index + 1 }}</Badge>
              <span class="font-medium">{{ model.name }}</span>
            </div>
            <div class="text-muted-foreground">
              {{ formatNumber(model.requests) }} 次 · {{ formatTokens(model.tokens) }} tokens
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token 组成</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="!hasTokenDetails" class="text-sm text-muted-foreground">
            暂无明细数据
          </div>
          <div v-else v-for="item in tokenBreakdownItems" :key="item.key" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-muted-foreground">
                {{ formatTokens(item.value) }} ({{ item.percent.toFixed(1) }}%)
              </span>
            </div>
            <Progress :model-value="item.percent" class="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>错误趋势</CardTitle>
        </CardHeader>
        <CardContent class="pt-2">
          <UsageChart
            :x-axis-data="errorTrendChart.dates"
            :series="errorTrendChart.series"
            type="line"
            :y-axis="[{ name: '错误数' }]"
          />
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4">
      <Card>
        <CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>请求事件明细</CardTitle>
          <div class="flex flex-wrap items-center gap-2">
            <select v-model="eventStatusFilter" :class="tableSelectClass">
              <option value="all">全部状态</option>
              <option value="success">仅成功</option>
              <option value="failed">仅失败</option>
            </select>
            <select v-model="eventSortKey" :class="tableSelectClass">
              <option value="time">按时间</option>
              <option value="tokens">按 Tokens</option>
            </select>
            <select v-model="eventSortOrder" :class="tableSelectClass">
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="requestEventRows.length === 0" class="text-sm text-muted-foreground">
            暂无请求事件数据
          </div>
          <div v-else-if="filteredRequestEventRows.length === 0" class="text-sm text-muted-foreground">
            当前筛选条件下暂无数据
          </div>
          <div v-else class="rounded-md border max-h-[320px] overflow-auto">
            <table class="w-full caption-bottom text-sm">
              <TableHeader class="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background">
                <TableRow>
                  <TableHead class="w-[170px]">时间</TableHead>
                  <TableHead class="w-[160px]">凭证</TableHead>
                  <TableHead class="w-[140px]">来源</TableHead>
                  <TableHead class="w-[140px]">API</TableHead>
                  <TableHead>模型</TableHead>
                  <TableHead class="w-[90px] text-center">状态</TableHead>
                  <TableHead class="w-[110px] text-right">Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in pagedRequestEventRows" :key="row.key">
                  <TableCell class="text-xs tabular-nums">{{ formatDateTime(row.timestamp) }}</TableCell>
                  <TableCell class="font-mono text-xs">
                    <div class="max-w-[180px] truncate" :title="row.authIndex">{{ row.authIndex }}</div>
                  </TableCell>
                  <TableCell class="text-xs">
                    <div class="max-w-[160px] truncate" :title="row.source">{{ row.source }}</div>
                  </TableCell>
                  <TableCell class="text-xs">
                    <div class="max-w-[160px] truncate" :title="row.api">{{ row.api }}</div>
                  </TableCell>
                  <TableCell class="text-xs">
                    <div class="max-w-[220px] truncate" :title="row.model">{{ row.model }}</div>
                  </TableCell>
                  <TableCell class="text-center">
                    <Badge :variant="row.failed ? 'destructive' : 'secondary'" class="text-[10px]">
                      {{ row.failed ? '失败' : '成功' }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatTokens(row.totalTokens) }}</TableCell>
                </TableRow>
              </TableBody>
            </table>
          </div>
          <div v-if="filteredRequestEventRows.length > 0" class="mt-3 flex items-center justify-between">
            <p class="text-xs text-muted-foreground">共 {{ formatNumber(filteredRequestEventRows.length) }} 条事件</p>
            <Pagination
              v-if="requestEventTotalPages > 1"
              :current-page="requestEventPage"
              :total-pages="requestEventTotalPages"
              @update:currentPage="requestEventPage = $event"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4">
      <Card>
        <CardHeader class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>凭证统计</CardTitle>
          <div class="flex flex-wrap items-center gap-2">
            <Input
              v-model="credentialKeyword"
              placeholder="筛选凭证"
              class="h-8 w-44 text-xs"
            />
            <select v-model="credentialSortKey" :class="tableSelectClass">
              <option value="requests">按请求数</option>
              <option value="failed">按失败数</option>
              <option value="failureRate">按失败率</option>
              <option value="totalTokens">按总Tokens</option>
              <option value="lastSeen">按最近请求</option>
            </select>
            <select v-model="credentialSortOrder" :class="tableSelectClass">
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="credentialStatsRows.length === 0" class="text-sm text-muted-foreground">
            暂无凭证统计数据
          </div>
          <div v-else-if="filteredCredentialStatsRows.length === 0" class="text-sm text-muted-foreground">
            当前筛选条件下暂无数据
          </div>
          <div v-else class="rounded-md border max-h-[320px] overflow-auto">
            <table class="w-full caption-bottom text-sm">
              <TableHeader class="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background">
                <TableRow>
                  <TableHead class="w-[180px]">凭证</TableHead>
                  <TableHead class="text-right w-[95px]">请求数</TableHead>
                  <TableHead class="text-right w-[95px]">失败数</TableHead>
                  <TableHead class="text-right w-[95px]">失败率</TableHead>
                  <TableHead class="text-right w-[110px]">总Tokens</TableHead>
                  <TableHead class="text-right w-[120px]">平均Tokens/请求</TableHead>
                  <TableHead class="text-right w-[110px]">来源数</TableHead>
                  <TableHead class="text-right w-[110px]">模型数</TableHead>
                  <TableHead>模型</TableHead>
                  <TableHead class="w-[170px]">最近请求</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in pagedCredentialStatsRows" :key="row.key">
                  <TableCell class="font-mono text-xs">
                    <div class="max-w-[220px] truncate" :title="row.authIndex">{{ row.authIndex }}</div>
                  </TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatNumber(row.requests) }}</TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatNumber(row.failed) }}</TableCell>
                  <TableCell class="text-right tabular-nums">
                    <span :class="getFailureRateClass(row.failureRate)">{{ row.failureRate.toFixed(1) }}%</span>
                  </TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatTokens(row.totalTokens) }}</TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatTokens(row.avgTokensPerRequest) }}</TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatNumber(row.sourceCount) }}</TableCell>
                  <TableCell class="text-right tabular-nums">{{ formatNumber(row.modelCount) }}</TableCell>
                  <TableCell class="text-xs">
                    <div class="max-w-[260px] truncate" :title="row.topModels">{{ row.topModels }}</div>
                  </TableCell>
                  <TableCell class="text-xs tabular-nums">{{ row.lastSeenAt }}</TableCell>
                </TableRow>
              </TableBody>
            </table>
          </div>
          <div v-if="filteredCredentialStatsRows.length > 0" class="mt-3 flex items-center justify-between">
            <p class="text-xs text-muted-foreground">共 {{ formatNumber(filteredCredentialStatsRows.length) }} 个凭证</p>
            <Pagination
              v-if="credentialStatsTotalPages > 1"
              :current-page="credentialStatsPage"
              :total-pages="credentialStatsTotalPages"
              @update:currentPage="credentialStatsPage = $event"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import { Bot, FileText, KeyRound, Package, RefreshCw } from 'lucide-vue-next'
import { useUsageStore } from '../../stores/usage'
import { useAuthStore } from '../../stores/auth'
import { providersApi, type ProviderType } from '../../api/providers'
import { authFilesApi } from '../../api/authFiles'
import { apiKeysApi } from '../../api/apiKeys'
import { usePagination } from '../../composables/usePagination'
import UsageChart from './UsageChart.vue'
import ServiceHealthMonitor from './ServiceHealthMonitor.vue'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import Card from '../ui/Card.vue'
import CardHeader from '../ui/CardHeader.vue'
import CardTitle from '../ui/CardTitle.vue'
import CardContent from '../ui/CardContent.vue'
import Badge from '../ui/badge/Badge.vue'
import Progress from '../ui/progress/Progress.vue'
import Pagination from '../ui/pagination/Pagination.vue'
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table'

const store = useUsageStore()
const authStore = useAuthStore()
const emit = defineEmits<{
  (e: 'navigate', tab: 'providers' | 'files' | 'settings'): void
}>()

const loading = computed(() => store.loading)
const globalStats = computed(() => store.globalStats)
const usageData = computed(() => store.usageData)
const usageDetails = computed(() => store.usageDetails)

const createTopSummary = () => ({
  managementKeys: 0,
  authFiles: 0,
  availableModels: 0,
  providers: {
    total: 0,
    gemini: 0,
    codex: 0,
    claude: 0,
    openai: 0,
    vertex: 0
  }
})

const topSummary = ref(createTopSummary())
const topSummaryLoading = ref(false)
const dashboardRefreshing = computed(() => loading.value || topSummaryLoading.value)

const providerBreakdownText = computed(() => {
  const providers = topSummary.value.providers
  const base = `G:${providers.gemini} C:${providers.codex} Cl:${providers.claude} O:${providers.openai}`
  return providers.vertex > 0 ? `${base} V:${providers.vertex}` : base
})

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000
const autoRefreshRemainingMs = ref(AUTO_REFRESH_INTERVAL_MS)
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

const autoRefreshCountdownLabel = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(autoRefreshRemainingMs.value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const resetAutoRefreshCountdown = () => {
  autoRefreshRemainingMs.value = AUTO_REFRESH_INTERVAL_MS
}

const handleTopCardClick = (target: 'keys' | 'providers' | 'files' | 'models') => {
  if (target === 'providers') {
    emit('navigate', 'providers')
    return
  }
  if (target === 'files') {
    emit('navigate', 'files')
    return
  }
  emit('navigate', 'settings')
}

const tokenTypeLegendItems = [
  { key: 'input', name: '输入 Tokens', color: '#3b82f6' },
  { key: 'output', name: '输出 Tokens', color: '#f97316' },
  { key: 'cached', name: '缓存 Tokens', color: '#14b8a6' },
  { key: 'reasoning', name: '思考 Tokens', color: '#8b5cf6' }
] as const

const normalizeApiKeys = (keys: string[]) => {
  const seen = new Set<string>()
  return keys
    .map((key) => String(key || '').trim())
    .filter((key) => key && !seen.has(key) && seen.add(key))
}

const normalizeApiBase = (input: string) => {
  let base = String(input || '').trim()
  if (!base) return ''
  base = base.replace(/\/?v0\/management\/?$/i, '')
  base = base.replace(/\/+$/g, '')
  if (!/^https?:\/\//i.test(base)) {
    base = `http://${base}`
  }
  return base
}

const normalizeModelList = (payload: any): string[] => {
  const raw = payload?.data ?? payload?.models ?? payload
  const list: string[] = []
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (!item) return
      if (typeof item === 'string') {
        list.push(item)
        return
      }
      const id = item.id ?? item.name ?? item.model
      if (id) list.push(String(id))
    })
  } else if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach((key) => list.push(String(key)))
  }
  const seen = new Set<string>()
  return list
    .map((model) => String(model).trim())
    .filter((model) => model && !seen.has(model) && seen.add(model))
    .sort((a, b) => a.localeCompare(b))
}

const successRateBadgeVariant = computed(() => {
  const rate = parseFloat(globalStats.value?.successRate || '0')
  if (rate >= 95) return 'default'
  if (rate >= 80) return 'secondary'
  return 'destructive'
})

const successRateColorClass = computed(() => {
  const rate = parseFloat(globalStats.value?.successRate || '0')
  if (rate >= 95) return 'text-green-600 dark:text-green-400'
  if (rate >= 80) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
})

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatTokens = (num: number) => {
  if (!Number.isFinite(num)) return '0'
  const absValue = Math.abs(num)
  const formatWithUnit = (value: number, unit: string, digits: number) => {
    return `${value.toFixed(digits).replace(/\.0+$/, '')}${unit}`
  }
  if (absValue >= 1_000_000) {
    const digits = absValue >= 100_000_000 ? 0 : 1
    return formatWithUnit(num / 1_000_000, 'M', digits)
  }
  if (absValue >= 1_000) {
    const digits = absValue >= 100_000 ? 0 : 1
    return formatWithUnit(num / 1_000, 'K', digits)
  }
  return num.toLocaleString()
}

const parseTimestamp = (value?: string) => {
  if (!value) return null
  const ts = Date.parse(value)
  return Number.isNaN(ts) ? null : ts
}

const formatDateTime = (value?: string) => {
  const ts = parseTimestamp(value)
  if (ts === null) return '-'
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const toFiniteNumber = (value: any) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const getDetailTotalTokens = (detail: any) => {
  const tokens = detail?.tokens || {}
  const total = toFiniteNumber(tokens.total_tokens)
  if (total > 0) return total
  return (
    toFiniteNumber(tokens.input_tokens) +
    toFiniteNumber(tokens.output_tokens) +
    toFiniteNumber(tokens.reasoning_tokens) +
    toFiniteNumber(tokens.cached_tokens)
  )
}

const getFailureRateClass = (rate: number) => {
  if (rate >= 20) return 'text-red-600 dark:text-red-400'
  if (rate >= 5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

const tableSelectClass = 'h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const SERVICE_HEALTH_DAYS = 7
const SERVICE_HEALTH_SLOT_MINUTES = 15
const SERVICE_HEALTH_YELLOW_THRESHOLD = 0.05

const maskApiName = (value: string) => {
  if (!value) return '***'
  const trimmed = value.trim()
  if (trimmed.length <= 4) return `${trimmed[0] || '*'}***`
  const start = trimmed.slice(0, 2)
  const end = trimmed.slice(-2)
  return `${start}***${end}`
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const formatDayKey = (date: Date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

const formatHourKey = (date: Date) => {
  return `${formatDayKey(date)} ${pad2(date.getHours())}`
}

const formatHourAxisLabel = (date: Date) => {
  const hour = pad2(date.getHours())
  if (date.getHours() === 0) {
    return `${formatDayKey(date)} ${hour}:00`
  }
  return `${hour}:00`
}

const HOURS_WINDOW = 12

const buildRecentHourSlots = (endHourInput?: Date, windowSize = HOURS_WINDOW) => {
  const endHour = endHourInput ? new Date(endHourInput) : new Date()
  endHour.setMinutes(0, 0, 0)
  return Array.from({ length: windowSize }, (_, index) => {
    const hour = new Date(endHour)
    hour.setHours(endHour.getHours() - (windowSize - 1 - index))
    return {
      key: formatHourKey(hour),
      label: formatHourAxisLabel(hour)
    }
  })
}

const parseHourLikeKey = (key: string) => {
  const trimmed = key.trim()
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2})(?::(\d{2}))?$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const hour = Number(match[4])
    const minute = match[5] ? Number(match[5]) : 0
    if (![year, month, day, hour, minute].every(Number.isFinite)) return null
    return new Date(year, month, day, hour, minute, 0, 0)
  }
  const ts = Date.parse(trimmed)
  if (Number.isNaN(ts)) return null
  return new Date(ts)
}

const usageHourBuckets = computed(() => {
  const map = new Map<string, {
    requests: number
    failed: number
    totalTokens: number
    input: number
    output: number
    cached: number
    reasoning: number
  }>()

  let latestHourTs: number | null = null

  usageDetails.value.forEach((detail: any) => {
    const timestamp = parseTimestamp(detail?.timestamp)
    if (timestamp === null) return
    const date = new Date(timestamp)
    date.setMinutes(0, 0, 0)
    const key = formatHourKey(date)
    const bucket = map.get(key) || {
      requests: 0,
      failed: 0,
      totalTokens: 0,
      input: 0,
      output: 0,
      cached: 0,
      reasoning: 0
    }
    const tokens = detail?.tokens || {}
    bucket.requests += 1
    if (detail?.failed) bucket.failed += 1
    bucket.totalTokens += getDetailTotalTokens(detail)
    bucket.input += toFiniteNumber(tokens.input_tokens)
    bucket.output += toFiniteNumber(tokens.output_tokens)
    bucket.cached += toFiniteNumber(tokens.cached_tokens)
    bucket.reasoning += toFiniteNumber(tokens.reasoning_tokens)
    map.set(key, bucket)
    latestHourTs = latestHourTs === null ? date.getTime() : Math.max(latestHourTs, date.getTime())
  })

  // Fallback: when details are missing, derive request/token trends from hourly summary.
  if (map.size === 0) {
    const applySummary = (
      record: Record<string, number> | undefined,
      field: 'requests' | 'totalTokens'
    ) => {
      Object.entries(record || {}).forEach(([hourKey, value]) => {
        const parsed = parseHourLikeKey(hourKey)
        if (!parsed) return
        parsed.setMinutes(0, 0, 0)
        const key = formatHourKey(parsed)
        const bucket = map.get(key) || {
          requests: 0,
          failed: 0,
          totalTokens: 0,
          input: 0,
          output: 0,
          cached: 0,
          reasoning: 0
        }
        bucket[field] += toFiniteNumber(value)
        map.set(key, bucket)
        latestHourTs = latestHourTs === null ? parsed.getTime() : Math.max(latestHourTs, parsed.getTime())
      })
    }

    applySummary(usageData.value?.requests_by_hour, 'requests')
    applySummary(usageData.value?.tokens_by_hour, 'totalTokens')
  }

  const endHour = latestHourTs !== null ? new Date(latestHourTs) : new Date()
  const hourSlots = buildRecentHourSlots(endHour)
  const emptyBucket = {
    requests: 0,
    failed: 0,
    totalTokens: 0,
    input: 0,
    output: 0,
    cached: 0,
    reasoning: 0
  }
  const entries = hourSlots.map((slot) => [slot, map.get(slot.key) || emptyBucket] as const)

  return { entries }
})

const serviceHealthPoints = computed(() => {
  const slotDurationMs = SERVICE_HEALTH_SLOT_MINUTES * 60 * 1000
  const slotCount = Math.floor((SERVICE_HEALTH_DAYS * 24 * 60) / SERVICE_HEALTH_SLOT_MINUTES)
  const now = Date.now()
  const endSlotTimestamp = Math.floor(now / slotDurationMs) * slotDurationMs
  const startSlotTimestamp = endSlotTimestamp - (slotCount - 1) * slotDurationMs

  const points = Array.from({ length: slotCount }, (_, index) => ({
    timestamp: startSlotTimestamp + index * slotDurationMs,
    successCount: 0,
    failureCount: 0
  }))

  usageDetails.value.forEach((detail: any) => {
    const timestamp = parseTimestamp(detail?.timestamp)
    if (timestamp === null || timestamp < startSlotTimestamp || timestamp > endSlotTimestamp + slotDurationMs - 1) {
      return
    }
    const slotTimestamp = Math.floor(timestamp / slotDurationMs) * slotDurationMs
    const index = Math.floor((slotTimestamp - startSlotTimestamp) / slotDurationMs)
    if (index < 0 || index >= points.length) return
    if (detail?.failed) {
      points[index].failureCount += 1
    } else {
      points[index].successCount += 1
    }
  })

  return points.map((point) => {
    const total = point.successCount + point.failureCount
    if (total === 0) {
      return {
        ...point,
        failureRate: 0,
        status: 'idle' as const
      }
    }
    const failureRate = point.failureCount / total
    if (failureRate === 0) {
      return {
        ...point,
        failureRate,
        status: 'success' as const
      }
    }
    if (failureRate <= SERVICE_HEALTH_YELLOW_THRESHOLD) {
      return {
        ...point,
        failureRate,
        status: 'mixed' as const
      }
    }
    return {
      ...point,
      failureRate,
      status: 'failure' as const
    }
  })
})

const tokenTypeHourDistribution = computed(() => {
  const entries = usageHourBuckets.value.entries

  return {
    dates: entries.map(([slot]) => slot.label),
    series: tokenTypeLegendItems.map((item) => ({
      name: item.name,
      data: entries.map(([, bucket]) => bucket[item.key]),
      type: 'line' as const,
      area: true,
      color: item.color
    }))
  }
})

const requestTrendChart = computed(() => {
  const entries = usageHourBuckets.value.entries
  return {
    dates: entries.map(([slot]) => slot.label),
    series: [
      {
        name: '请求数',
        data: entries.map(([, bucket]) => bucket.requests),
        type: 'line' as const,
        area: true,
        color: '#0ea5e9'
      }
    ]
  }
})

const tokenUsageTrendChart = computed(() => {
  const entries = usageHourBuckets.value.entries
  return {
    dates: entries.map(([slot]) => slot.label),
    series: [
      {
        name: 'Token 使用量',
        data: entries.map(([, bucket]) => bucket.totalTokens),
        type: 'line' as const,
        area: true,
        color: '#f97316'
      }
    ]
  }
})

const errorTrendChart = computed(() => {
  const entries = usageHourBuckets.value.entries
  return {
    dates: entries.map(([slot]) => slot.label),
    series: [
      {
        name: '错误数',
        data: entries.map(([, bucket]) => bucket.failed),
        type: 'line' as const,
        area: true,
        color: '#ef4444'
      }
    ]
  }
})

const last24hRequests = computed(() => {
  const entries = Object.entries(usageData.value?.requests_by_hour || {}).sort(([a], [b]) => a.localeCompare(b))
  return entries.slice(-24).reduce((sum, [, value]) => sum + (value || 0), 0)
})

const last24hTokens = computed(() => {
  const entries = Object.entries(usageData.value?.tokens_by_hour || {}).sort(([a], [b]) => a.localeCompare(b))
  return entries.slice(-24).reduce((sum, [, value]) => sum + (value || 0), 0)
})

const avgTokensPerRequest = computed(() => {
  const totalRequests = globalStats.value?.totalRequests || 0
  const totalTokens = globalStats.value?.totalTokens || 0
  if (totalRequests === 0) return 0
  return Number((totalTokens / totalRequests).toFixed(2))
})

const topApis = computed(() => {
  const apis = usageData.value?.apis || {}
  return Object.entries(apis)
    .map(([name, entry]) => ({
      name,
      requests: entry?.total_requests || 0,
      tokens: entry?.total_tokens || 0
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 6)
})

const topModels = computed(() => {
  const apis = usageData.value?.apis || {}
  const modelMap = new Map<string, { requests: number; tokens: number }>()
  Object.values(apis).forEach((apiEntry: any) => {
    const models = apiEntry?.models || {}
    Object.entries(models).forEach(([modelName, modelEntry]: [string, any]) => {
      const prev = modelMap.get(modelName) || { requests: 0, tokens: 0 }
      modelMap.set(modelName, {
        requests: prev.requests + (modelEntry?.total_requests || 0),
        tokens: prev.tokens + (modelEntry?.total_tokens || 0)
      })
    })
  })

  return Array.from(modelMap.entries())
    .map(([name, values]) => ({ name, requests: values.requests, tokens: values.tokens }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 6)
})

const topSummaryAvailableModels = computed(() => {
  return topSummary.value.availableModels
})

const tokenBreakdown = computed(() => {
  const totals = {
    input: 0,
    output: 0,
    reasoning: 0,
    cached: 0,
    total: 0
  }

  usageDetails.value.forEach((detail: any) => {
    const tokens = detail?.tokens || {}
    const input = tokens.input_tokens || 0
    const output = tokens.output_tokens || 0
    const reasoning = tokens.reasoning_tokens || 0
    const cached = tokens.cached_tokens || 0
    const total = Number.isFinite(tokens.total_tokens)
      ? tokens.total_tokens
      : input + output + reasoning + cached

    totals.input += input
    totals.output += output
    totals.reasoning += reasoning
    totals.cached += cached
    totals.total += total
  })

  return totals
})

const hasTokenDetails = computed(() => tokenBreakdown.value.total > 0)

const tokenBreakdownItems = computed(() => {
  const total = tokenBreakdown.value.total || 0
  if (total <= 0) return []
  const buildItem = (key: string, label: string, value: number) => ({
    key,
    label,
    value,
    percent: (value / total) * 100
  })

  return [
    buildItem('input', 'Input Tokens', tokenBreakdown.value.input),
    buildItem('output', 'Output Tokens', tokenBreakdown.value.output),
    buildItem('reasoning', 'Reasoning Tokens', tokenBreakdown.value.reasoning),
    buildItem('cached', 'Cached Tokens', tokenBreakdown.value.cached)
  ].filter((item) => item.value > 0)
})

const requestEventRows = computed(() => {
  const apis = usageData.value?.apis || {}
  const rows: Array<{
    key: string
    timestamp: string
    timestampMs: number | null
    authIndex: string
    source: string
    api: string
    model: string
    failed: boolean
    totalTokens: number
  }> = []

  Object.entries(apis).forEach(([apiName, apiEntry]: [string, any]) => {
    const models = apiEntry?.models || {}
    Object.entries(models).forEach(([modelName, modelEntry]: [string, any]) => {
      const details = Array.isArray(modelEntry?.details) ? modelEntry.details : []
      details.forEach((detail: any, index: number) => {
        const timestamp = String(detail?.timestamp || '')
        const authIndex = String(detail?.auth_index || 'unknown')
        const source = String(detail?.source || 'unknown')
        const failed = Boolean(detail?.failed)
        const totalTokens = getDetailTotalTokens(detail)
        rows.push({
          key: `${apiName}:${modelName}:${authIndex}:${timestamp || 'na'}:${index}`,
          timestamp,
          timestampMs: parseTimestamp(timestamp),
          authIndex,
          source,
          api: apiName,
          model: modelName,
          failed,
          totalTokens
        })
      })
    })
  })

  return rows.sort((a, b) => {
    const aTs = a.timestampMs ?? Number.NEGATIVE_INFINITY
    const bTs = b.timestampMs ?? Number.NEGATIVE_INFINITY
    return bTs - aTs
  })
})

const eventStatusFilter = ref<'all' | 'success' | 'failed'>('all')
const eventSortKey = ref<'time' | 'tokens'>('time')
const eventSortOrder = ref<'desc' | 'asc'>('desc')

const filteredRequestEventRows = computed(() => {
  let rows = requestEventRows.value

  if (eventStatusFilter.value === 'failed') {
    rows = rows.filter((row) => row.failed)
  } else if (eventStatusFilter.value === 'success') {
    rows = rows.filter((row) => !row.failed)
  }

  const sorted = rows.slice()
  const factor = eventSortOrder.value === 'asc' ? 1 : -1
  sorted.sort((a, b) => {
    if (eventSortKey.value === 'tokens') {
      return (a.totalTokens - b.totalTokens) * factor
    }
    const aTs = a.timestampMs ?? Number.NEGATIVE_INFINITY
    const bTs = b.timestampMs ?? Number.NEGATIVE_INFINITY
    return (aTs - bTs) * factor
  })
  return sorted
})

const credentialStatsRows = computed(() => {
  const map = new Map<string, {
    key: string
    authIndex: string
    requests: number
    failed: number
    totalTokens: number
    lastSeenMs: number | null
    sources: Set<string>
    models: Set<string>
    modelStats: Map<string, number>
  }>()

  requestEventRows.value.forEach((event) => {
    const key = event.authIndex || 'unknown'
    const existing = map.get(key) || {
      key: `credential:${key}`,
      authIndex: key,
      requests: 0,
      failed: 0,
      totalTokens: 0,
      lastSeenMs: null,
      sources: new Set<string>(),
      models: new Set<string>(),
      modelStats: new Map<string, number>()
    }

    existing.requests += 1
    if (event.failed) existing.failed += 1
    existing.totalTokens += event.totalTokens
    existing.sources.add(event.source || 'unknown')
    const modelName = event.model || 'unknown'
    existing.models.add(modelName)
    existing.modelStats.set(modelName, (existing.modelStats.get(modelName) || 0) + 1)
    if (event.timestampMs !== null) {
      existing.lastSeenMs = existing.lastSeenMs === null
        ? event.timestampMs
        : Math.max(existing.lastSeenMs, event.timestampMs)
    }

    map.set(key, existing)
  })

  return Array.from(map.values())
    .map((row) => {
      const failureRate = row.requests > 0 ? (row.failed / row.requests) * 100 : 0
      const topModels = Array.from(row.modelStats.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => `${name}(${count})`)
        .join(', ')
      return {
        key: row.key,
        authIndex: row.authIndex,
        requests: row.requests,
        failed: row.failed,
        failureRate,
        totalTokens: row.totalTokens,
        avgTokensPerRequest: row.requests > 0 ? row.totalTokens / row.requests : 0,
        lastSeenMs: row.lastSeenMs,
        lastSeenAt: row.lastSeenMs ? new Date(row.lastSeenMs).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) : '-',
        sourceCount: row.sources.size,
        modelCount: row.models.size,
        topModels: topModels || '-'
      }
    })
    .sort((a, b) => {
      if (b.requests !== a.requests) return b.requests - a.requests
      if (b.failed !== a.failed) return b.failed - a.failed
      return b.totalTokens - a.totalTokens
    })
})

const credentialKeyword = ref('')
const credentialSortKey = ref<'requests' | 'failed' | 'failureRate' | 'totalTokens' | 'lastSeen'>('requests')
const credentialSortOrder = ref<'desc' | 'asc'>('desc')

const filteredCredentialStatsRows = computed(() => {
  const keyword = credentialKeyword.value.trim().toLowerCase()
  let rows = credentialStatsRows.value
  if (keyword) {
    rows = rows.filter((row) => row.authIndex.toLowerCase().includes(keyword))
  }

  const sorted = rows.slice()
  const factor = credentialSortOrder.value === 'asc' ? 1 : -1
  sorted.sort((a, b) => {
    switch (credentialSortKey.value) {
      case 'failed':
        return (a.failed - b.failed) * factor
      case 'failureRate':
        return (a.failureRate - b.failureRate) * factor
      case 'totalTokens':
        return (a.totalTokens - b.totalTokens) * factor
      case 'lastSeen': {
        const aMs = a.lastSeenMs ?? Number.NEGATIVE_INFINITY
        const bMs = b.lastSeenMs ?? Number.NEGATIVE_INFINITY
        return (aMs - bMs) * factor
      }
      case 'requests':
      default:
        return (a.requests - b.requests) * factor
    }
  })
  return sorted
})

const {
  currentPage: requestEventPage,
  totalPages: rawRequestEventTotalPages,
  paginatedData: pagedRequestEventRows
} = usePagination(filteredRequestEventRows, {
  defaultPageSize: 20,
  resetWatchers: [filteredRequestEventRows]
})

const requestEventTotalPages = computed(() => Math.max(1, rawRequestEventTotalPages.value))

const {
  currentPage: credentialStatsPage,
  totalPages: rawCredentialStatsTotalPages,
  paginatedData: pagedCredentialStatsRows
} = usePagination(filteredCredentialStatsRows, {
  defaultPageSize: 15,
  resetWatchers: [filteredCredentialStatsRows]
})

const credentialStatsTotalPages = computed(() => Math.max(1, rawCredentialStatsTotalPages.value))

const loadTopSummary = async () => {
  topSummaryLoading.value = true
  try {
    const providerTypes: ProviderType[] = ['gemini', 'codex', 'claude', 'openai', 'vertex']
    const [apiKeysResult, authFilesResult, ...providerResults] = await Promise.allSettled([
      apiKeysApi.list(),
      authFilesApi.list(),
      ...providerTypes.map((type) => providersApi.getProviders(type))
    ])

    const next = createTopSummary()
    const normalizedApiKeys = apiKeysResult.status === 'fulfilled'
      ? normalizeApiKeys(apiKeysResult.value)
      : []

    next.managementKeys = normalizedApiKeys.length
    if (!next.managementKeys && authStore.managementKey) {
      next.managementKeys = 1
    }

    if (authFilesResult.status === 'fulfilled') {
      const files = Array.isArray(authFilesResult.value?.files) ? authFilesResult.value.files : []
      next.authFiles = files.length
    }

    if (authStore.isConnected && authStore.apiUrl && normalizedApiKeys.length > 0) {
      const base = normalizeApiBase(authStore.apiUrl)
      if (base) {
        try {
          const response = await axios.get(`${base}/v1/models`, {
            headers: {
              Authorization: `Bearer ${normalizedApiKeys[0]}`
            }
          })
          next.availableModels = normalizeModelList(response.data).length
        } catch (error) {
          console.warn('Failed to load models from /v1/models:', error)
        }
      }
    }

    providerTypes.forEach((type, index) => {
      const result = providerResults[index]
      if (result.status !== 'fulfilled') return
      const list = Array.isArray(result.value) ? result.value : []

      next.providers.total += list.length
      if (type === 'gemini') next.providers.gemini = list.length
      if (type === 'codex') next.providers.codex = list.length
      if (type === 'claude') next.providers.claude = list.length
      if (type === 'openai') next.providers.openai = list.length
      if (type === 'vertex') next.providers.vertex = list.length
    })

    topSummary.value = next
  } catch (error) {
    console.error('Failed to load dashboard top summary:', error)
  } finally {
    topSummaryLoading.value = false
  }
}

const refreshData = async (options: { resetAutoRefresh?: boolean } = {}) => {
  await Promise.all([
    store.fetchUsage(true),
    loadTopSummary()
  ])
  if (options.resetAutoRefresh !== false) {
    resetAutoRefreshCountdown()
  }
}

const startAutoRefresh = () => {
  if (autoRefreshTimer) return
  autoRefreshTimer = setInterval(() => {
    if (autoRefreshRemainingMs.value <= 1000) {
      resetAutoRefreshCountdown()
      if (!dashboardRefreshing.value) {
        void refreshData({ resetAutoRefresh: false })
      }
      return
    }
    autoRefreshRemainingMs.value -= 1000
  }, 1000)
}

const stopAutoRefresh = () => {
  if (!autoRefreshTimer) return
  clearInterval(autoRefreshTimer)
  autoRefreshTimer = null
}

onMounted(() => {
  store.fetchUsage()
  loadTopSummary()
  resetAutoRefreshCountdown()
  startAutoRefresh()
  store.startPolling()
})

onUnmounted(() => {
  stopAutoRefresh()
  store.stopPolling()
})
</script>
