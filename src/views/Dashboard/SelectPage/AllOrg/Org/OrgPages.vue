<template>
  <div
    id="org-item__org-page"
    class="bg-white rounded-b-lg flex flex-col gap-3"
  >
    <template v-for="(group, key) of grouped_page_list">
      <div class="flex flex-col gap-0.5 group/platform">
        <div
          class="flex justify-between items-center rounded bg-slate-100 px-2 py-0.5 text-xs"
        >
          <div class="flex items-center gap-1">
            <PageTypeIcon
              :page_type="key as PageType"
              class="size-3"
            />
            <p class="font-medium">
              {{ $t(`v1.common.${key?.toLocaleLowerCase()}`) }}
            </p>
          </div>
          <button
            class="flex gap-1 invisible group-hover/platform:visible hover:text-blue-700"
            @click="$main.quickGroupAllPlatformPage(group)"
          >
            {{ $t('v1.view.main.dashboard.select_page.munti_chat_page') }}
            <ArrowRightCircleIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-y-0.5 gap-x-6">
          <PageItem
            v-for="page of group"
            @select_page="triggerSelectPage"
            @sort_list_page="$emit('sort_list_page')"
            :page_info="page?.page!"
            :page="page"
            :org_id
            container_class="!border-none"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { usePageStore } from '@/stores'
import { usePageManager } from '@/views/Dashboard/composables/usePageManager'
import { KEY_ADVANCE_SELECT_AGE_FUNCT } from '@/views/Dashboard/SelectPage/symbol'
import { set } from 'lodash'
import { computed, inject } from 'vue'

import PageItem from '@/views/Dashboard/SelectPage/PageItem.vue'

import PageTypeIcon from '@/components/Avatar/PageTypeIcon.vue'
import { ArrowRightCircleIcon } from '@heroicons/vue/24/solid'

import type { PageData, PageType } from '@/service/interface/app/page'

const $emit = defineEmits(['sort_list_page'])

const $props = withDefaults(
  defineProps<{
    /** id tổ chức */
    org_id?: string
  }>(),
  {}
)

const pageStore = usePageStore()

/** composable */
const { goToChat } = usePageManager()

/**xử lý khi trang được chọn ở chế độ nhiều */
const triggerSelectPage = inject(KEY_ADVANCE_SELECT_AGE_FUNCT)

/**danh sách page sau khi được lọc */
const active_page_list = defineModel<PageData[]>('active_page_list', {
  default: [],
})

/** danh sách được nhóm theo nền tảng */
const grouped_page_list = computed<Record<string, PageData[]>>(() => {
  /** danh sách được nhóm theo từng nền tảng */
  let result: Record<string, PageData[]> = {}

  active_page_list.value.forEach(page => {
    /** nền tảng của trang */
    const PAGE_TYPE = page.page?.type || ''

    // nếu không có thì thôi
    if (!PAGE_TYPE) return

    // thêm trang vào nền tảng tương ứng
    result[PAGE_TYPE] = [...(result[PAGE_TYPE] || []), page]
  })

  return result
})

class Main {
  /**
   * chọn toàn bộ trang của 1 nền tảng của tổ chức hiện tại
   * @param platform_pages các trang của 1 nền tảng
   */
  selectAllPlatformPage(platform_pages: PageData[]) {
    // reset lại danh sách các trang
    pageStore.selected_page_id_list = {}

    // lặp qua từng trang khả thi của tổ chức này
    platform_pages?.forEach(page => {
      /**id trang */
      const PAGE_ID = page?.page?.fb_page_id

      // nếu không có id trang thì bỏ qua
      if (!PAGE_ID) return

      // chọn trang này
      set(pageStore.selected_page_id_list, PAGE_ID, true)
    })

    /**trang đầu tiên của tổ chức */
    const FIRST_PAGE = platform_pages?.[0]

    // gọi hàm xử lý khi trang được chọn ở chế độ nhiều
    if (FIRST_PAGE) triggerSelectPage?.(FIRST_PAGE)
  }

  /**vào chế độ gộp trang + chọn toàn bộ các trang của nền tảng */
  quickGroupAllPlatformPage(platform_pages: PageData[]) {
    // chọn toàn bộ trang của 1 nền tảng của tổ chức hiện tại
    this.selectAllPlatformPage(platform_pages)

    // vào chat luôn
    goToChat()
  }
}

const $main = new Main()
</script>
