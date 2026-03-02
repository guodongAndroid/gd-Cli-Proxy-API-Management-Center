<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import Button from '../Button.vue'
import Input from '../Input.vue'

interface Props {
  currentPage: number
  totalPages: number
  showPageInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPageInput: true
})
const emit = defineEmits(['update:currentPage'])

const pageInput = ref('1')

const clampPage = (page: number) => {
  const maxPage = Math.max(1, props.totalPages)
  if (!Number.isFinite(page)) return 1
  return Math.min(maxPage, Math.max(1, Math.floor(page)))
}

const changePage = (page: number) => {
  emit('update:currentPage', clampPage(page))
}

const jumpToPage = () => {
  const parsed = Number(pageInput.value)
  const nextPage = clampPage(parsed)
  emit('update:currentPage', nextPage)
  pageInput.value = String(nextPage)
}

watch(
  () => [props.currentPage, props.totalPages],
  () => {
    pageInput.value = String(clampPage(props.currentPage))
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8"
      :disabled="currentPage === 1"
      @click="changePage(1)"
    >
      <ChevronsLeft class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>

    <div class="flex items-center gap-1 px-1">
      <Input
        v-if="showPageInput"
        v-model="pageInput"
        type="number"
        min="1"
        :max="Math.max(totalPages, 1)"
        class="h-8 w-16 text-center px-2"
        @keyup.enter="jumpToPage"
        @blur="jumpToPage"
      />
      <span v-else class="text-sm font-medium">{{ currentPage }}</span>
      <span class="text-sm text-muted-foreground">/ {{ totalPages }}</span>
    </div>

    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      <ChevronRight class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8"
      :disabled="currentPage === totalPages"
      @click="changePage(totalPages)"
    >
      <ChevronsRight class="h-4 w-4" />
    </Button>
  </div>
</template>
