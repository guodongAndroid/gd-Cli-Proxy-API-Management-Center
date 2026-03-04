<script setup lang="ts">
import { computed } from 'vue'
import { getAvailabilityRateClass } from '../../config/constants'

export type ServiceHealthStatus = 'success' | 'mixed' | 'failure' | 'idle'

export interface ServiceHealthPoint {
  timestamp: number
  successCount: number
  failureCount: number
  failureRate: number
  status: ServiceHealthStatus
}

interface Props {
  points: ServiceHealthPoint[]
  windowLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  windowLabel: '最近 7 天'
})

const stats = computed(() => {
  const active = props.points.filter((point) => point.successCount + point.failureCount > 0)
  const healthy = active.filter((point) => point.status === 'success').length
  const healthRate = active.length > 0 ? (healthy / active.length) * 100 : 0
  return {
    activeCount: active.length,
    healthRate
  }
})

const pointClassMap: Record<ServiceHealthStatus, string> = {
  success: 'bg-green-500 dark:bg-green-400',
  mixed: 'bg-yellow-400 dark:bg-yellow-300',
  failure: 'bg-red-500 dark:bg-red-400',
  idle: 'bg-gray-200 dark:bg-gray-700'
}

const getPointClass = (status: ServiceHealthStatus) => pointClassMap[status]

const formatPointTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const getPointTooltip = (point: ServiceHealthPoint) => {
  const total = point.successCount + point.failureCount
  if (total === 0) return `${formatPointTime(point.timestamp)}: 无请求`
  return `${formatPointTime(point.timestamp)}: 成功 ${point.successCount} / 失败 ${point.failureCount} (失败率 ${(point.failureRate * 100).toFixed(1)}%)`
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-[30px] font-bold tracking-tight">服务健康监测</h3>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">{{ windowLabel }}</span>
        <span :class="['inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold', getAvailabilityRateClass(stats.healthRate)]">
          {{ stats.healthRate.toFixed(1) }}%
        </span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="grid min-w-[1080px] grid-cols-[repeat(96,minmax(0,1fr))] gap-1">
        <div
          v-for="(point, index) in points"
          :key="`${point.timestamp}-${index}`"
          class="h-3 w-full rounded-[2px]"
          :class="getPointClass(point.status)"
          :title="getPointTooltip(point)"
        />
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>最早</span>
      <span class="h-2.5 w-2.5 rounded-[2px] bg-red-500 dark:bg-red-400" />
      <span class="h-2.5 w-2.5 rounded-[2px] bg-yellow-400 dark:bg-yellow-300" />
      <span class="h-2.5 w-2.5 rounded-[2px] bg-green-500 dark:bg-green-400" />
      <span>最新</span>
    </div>
  </div>
</template>
