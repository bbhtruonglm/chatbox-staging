<template>
  <Modal
    ref="modal_widget__group_ref"
    class_modal="w-[432px]"
    :class_body="`flex flex-col gap-2 ${
      view === 'SEARCH' || !view ? 'h-[90dvh]' : 'h-[80dvh]'
    }`"
  >
    <template #header>
      {{ $t('v1.common.create_zalo_group') }}
    </template>

    <template #body>
      <div class="bg-white h-full w-full rounded-md p-2 flex flex-col gap-4">
        <!-- Tạo group -->
        <label>{{ $t('v1.common.create_new_group') }}</label>
        <div class="flex gap-2 items-center w-full">
          <input
            v-model="groupName"
            :class="[
              'border h-8 w-full rounded px-2 py-0.5 text-sm',
              errorGroupName ? 'border-red-500' : '',
            ]"
            :placeholder="$t('v1.common.your_group_name')"
          />
          <button
            class="flex-shrink-0 bg-blue-700 text-white px-2 py-1 rounded-md text-sm"
            @click="handleCreateGroup"
          >
            {{ $t('v1.common.create_group') }}
          </button>
        </div>
        <p
          v-if="errorSelectMembers"
          class="text-red-500 text-xs mt-1"
        >
          {{ errorSelectMembers }}
        </p>

        <!-- Search member -->
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-slate-500"
          />
          <input
            v-model="search_conversation"
            class="w-full bg-slate-100 placeholder-slate-500 py-1.5 pl-9 pr-8 text-sm rounded-md"
            type="text"
            :placeholder="$t('v1.common.search_member')"
          />
          <XMarkIcon
            @click="search_conversation = undefined"
            v-if="search_conversation"
            class="absolute top-1/2 right-2 -translate-y-1/2 size-5 text-red-500 cursor-pointer"
          />
        </div>

        <!-- Selected info -->
        <div class="flex w-full gap-2 items-center justify-between text-xs">
          <span
            class="p-0.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md"
          >
            {{ $t('v1.common.member_selected') }}
            {{ selectedMembers.length }}/100
          </span>
          <span
            class="p-0.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md"
            >{{ count_conversation }}</span
          >
        </div>

        <!-- List conversation -->
        <div class="flex-1 overflow-y-auto border-t border-slate-200 pt-2">
          <div
            v-for="conv in filteredConversations"
            :key="conv.fb_client_id + '_' + conv.fb_page_id"
            class="flex items-center justify-between p-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            @click="toggleMember(conv)"
          >
            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                :checked="selectedMembers.includes(conv)"
                @click.stop
                class="h-4 w-4 text-blue-600"
              />
              <img
                :src="conv.client_avatar"
                alt=""
                class="size-10 rounded-full"
              />
              <div>
                <p class="text-sm font-medium">{{ conv.client_name }}</p>
                <p class="text-xs text-slate-500">
                  {{ conv.client_phone || '-' }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="filteredConversations.length === 0"
            class="p-2 text-slate-400 text-sm"
          >
            {{ $t('v1.common.no_data') }}
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { container } from 'tsyringe'

import { useOrgStore, usePageStore } from '@/stores'
import { N4SerivceAppConversation } from '@/utils/api/N4Service/Conversation'
import type { FilterConversation } from '@/service/interface/app/conversation'
import Modal from '@/components/Modal.vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { keys } from 'lodash'
import { N4SerivceAppZaloPersonal } from '@/utils/api/N4Service/ZaloPersonal'
import { N13ZaloPersonal } from '@/utils/api/N13ZaloPersonal'

/** stores */
const orgStore = useOrgStore()
const pageStore = usePageStore()

/** UI state */
const groupName = ref('')
const search_conversation = ref<string>()
const modal_widget__group_ref = ref<InstanceType<typeof Modal>>()
const view = ref<'SEARCH' | 'CHAT' | 'FRIEND_REQUEST' | ''>('')
const isModalOpen = ref(false)

/** conversation data */
const conversations = ref<any[]>([])
const selectedMembers = ref<any[]>([])
const count_conversation = ref<number>(0)
const afterCursor = ref<number[] | null>(null)
const isFetching = ref(false)

/** validation */
const errorGroupName = ref(false)
const errorSelectMembers = ref('')

// Khởi tạo trực tiếp instance API Zalo
const API_ZALO = new N13ZaloPersonal('app/page/group')

/* ============================================================
   MAIN CLASS – CHỈ CHỨA LOGIC API, KHÔNG CHỨA STORE
============================================================== */
class Main {
  constructor(
    private readonly API = container.resolve(N4SerivceAppConversation)
  ) {}

  toggleModal() {
    modal_widget__group_ref.value?.toggleModal()
    isModalOpen.value = !isModalOpen.value
    if (isModalOpen.value) fetchAllConversations()
  }

  async getConversation(params: {
    pageIds: string[]
    orgId: string
    filter: FilterConversation
    limit: number
    sort: string
    after?: number[] | null
  }) {
    try {
      return await this.API.readConversations(
        params.pageIds,
        params.orgId,
        params.filter,
        params.limit,
        params.sort,
        params.after
      )
    } catch (err) {
      console.error('Lỗi getConversation:', err)
      return { result: [], after: null, count: 0 }
    }
  }

  async countConversation(params: {
    pageIds: string[]
    filter: FilterConversation
  }) {
    try {
      return await this.API.countConversation(params.pageIds, params.filter)
    } catch (err) {
      console.error('Lỗi countConversation:', err)
      return { count: 0 }
    }
  }
}

const $main = new Main()

/** ============================================
 *  Fetch toàn bộ conversation theo after
============================================ */
async function fetchAllConversations() {
  if (isFetching.value) return
  isFetching.value = true

  const PAGE_IDS = keys(pageStore.selected_page_id_list)
  const FILTER: FilterConversation = {
    conversation_type: 'CHAT',
    display_style: 'FRIEND',
    is_spam_fb: 'NO',
  }
  const SORT = 'unread_message_amount:desc,last_message_time:desc'

  conversations.value = []
  selectedMembers.value = []
  afterCursor.value = null

  let keepFetching = true
  while (keepFetching) {
    const res = await $main.getConversation({
      pageIds: PAGE_IDS,
      orgId: orgStore.selected_org_id || '',
      filter: FILTER,
      limit: 50,
      sort: SORT,
      after: afterCursor.value || null,
    })

    if (res?.result?.length) {
      conversations.value.push(...res.result)
      afterCursor.value = res.after || null
      keepFetching = !!afterCursor.value
    } else {
      keepFetching = false
    }

    count_conversation.value = res?.count || conversations.value.length
  }

  isFetching.value = false
}

/** search filter computed: name OR phone (local) */
const filteredConversations = computed(() => {
  if (!search_conversation.value) return conversations.value
  const keyword = search_conversation.value.toLowerCase()
  return conversations.value.filter(
    conv =>
      (conv.client_name || '').toLowerCase().includes(keyword) ||
      (conv.client_phone || '').includes(keyword)
  )
})

/** ============================================================
 *  HANDLE CREATE GROUP – sử dụng API_ZALO
=============================================================== */
async function handleCreateGroup() {
  // reset error
  errorGroupName.value = false
  errorSelectMembers.value = ''

  if (!groupName.value.trim()) {
    errorGroupName.value = true
    return
  }
  if (selectedMembers.value.length < 2) {
    errorSelectMembers.value = 'Vui lòng chọn ít nhất 2 thành viên'
    return
  }

  // Lấy page_id mặc định
  const PAGE_IDS = keys(pageStore.selected_page_id_list)
  const page_id = PAGE_IDS[0] || '' // lấy page đầu tiên

  // Payload
  const payload = {
    group_name: groupName.value.trim(),
    member_ids: selectedMembers.value.map(m => m.fb_client_id),
    page_id,
  }

  try {
    const data = await API_ZALO.createGroupZalo(payload)
    console.log('Tạo group thành công:', data)
    // Reset UI
    groupName.value = ''
    selectedMembers.value = []
    modal_widget__group_ref.value?.toggleModal()
  } catch (err) {
    console.error('Lỗi khi tạo group:', err)
  }
}

function toggleMember(conv: any) {
  errorSelectMembers.value = ''
  const index = selectedMembers.value.findIndex(
    m =>
      m.fb_client_id === conv.fb_client_id && m.fb_page_id === conv.fb_page_id
  )
  if (index >= 0) {
    selectedMembers.value.splice(index, 1)
  } else {
    selectedMembers.value.push(conv)
  }
}

/** Expose toggleModal cho component cha */
defineExpose({ toggleModal: $main.toggleModal.bind($main) })
</script>
