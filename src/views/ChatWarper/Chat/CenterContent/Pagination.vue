<template>
  <div class="flex flex-row items-center justify-end p-1 gap-5">
    <!-- Nút chuyển trang -->
    <div class="flex justify-between items-center gap-2">
      <button
        @click="handlePrevious"
        :disabled="currentPage === 1 || isLoading"
        class="rounded disabled:opacity-50"
      >
        <ChevronLeftIcon class="size-4" />
      </button>

      <div
        class="bg-blue-700 py-0.5 px-2 rounded-md text-white text-sm font-medium"
      >
        {{ currentPage }}
      </div>

      <button
        @click="handleNext"
        :disabled="!isNextPage || isLoading"
        class="rounded disabled:opacity-50"
      >
        <ChevronRightIcon class="size-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ref, watch } from 'vue'

interface PaginationProps {
  /** Trang hiện tại (từ cha) */
  currentPageParent: number
  /** Có thể chuyển trang tiếp theo không */
  isNextPage: boolean
  /** Đang loading không */
  isLoading: boolean

  /** Callback khi chuyển trang */
  onPageChange: (page: number, direction: 'next' | 'prev') => void

  /** Có cần reset trang không */
  onReset?: boolean
}

const props = defineProps<PaginationProps>()
const emit = defineEmits(['update:page'])

const currentPage = ref(props.currentPageParent || 1)

/** Xử lý Previous */
const handlePrevious = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    props.onPageChange(currentPage.value, 'prev')
    emit('update:page', currentPage.value)
  }
}

/** Xử lý Next */
const handleNext = () => {
  if (props.isNextPage) {
    currentPage.value++
    props.onPageChange(currentPage.value, 'next')
    emit('update:page', currentPage.value)
  }
}

/** Reset lại khi prop thay đổi */
watch(
  () => props.onReset,
  newVal => {
    if (newVal) {
      currentPage.value = 1
    }
  }
)

/** Cập nhật khi cha thay đổi currentPageParent */
watch(
  () => props.currentPageParent,
  newVal => {
    currentPage.value = newVal
  }
)
</script>
