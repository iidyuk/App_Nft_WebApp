<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center mt-8 space-x-2">
    <!-- 前のページボタン -->
    <button 
      @click="goToPreviousPage"
      :disabled="currentPage === 1"
      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      前へ
    </button>

    <!-- ページ番号ボタン -->
    <div class="flex space-x-1">
      <button 
        v-for="page in pageNumbers" 
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-2 text-sm font-medium rounded-md',
          page === currentPage 
            ? 'text-white bg-blue-600 border border-blue-600' 
            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- 次のページボタン -->
    <button 
      @click="goToNextPage"
      :disabled="currentPage === totalPages"
      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      次へ
    </button>
  </div>

  <!-- ページ情報 -->
  <div v-if="totalItems > 0" class="text-center mt-4 text-sm text-gray-600">
    {{ startItem }} - {{ endItem }} / {{ totalItems }} 件
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Computed properties
const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= props.totalPages; i++) {
    pages.push(i)
  }
  return pages
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>
