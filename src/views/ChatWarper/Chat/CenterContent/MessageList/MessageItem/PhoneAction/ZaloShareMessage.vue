<template>
  <Modal
    ref="modal_widget__group_share_ref"
    class_modal="w-[80dvw]"
    :class_body="`flex flex-col gap-2 ${
      view === 'SEARCH' || !view ? 'h-[90dvh]' : 'h-[80dvh]'
    }`"
  >
    <template #header>
      {{ $t('v1.common.share_message') }}
    </template>

    <template #body>
      <div class="flex gap-2 overflow-hidden h-full">
        <div class="bg-white h-full w-1/2 rounded-md p-2 flex flex-col gap-2">
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
          <!-- <div class="flex w-full gap-2 items-center justify-between text-xs">
            <span
              class="p-0.5 px-2 bg-blue-50 text-blue-700 font-semibold rounded-md"
            >
              {{ $t('v1.common.member_selected') }}
              {{ selected_members.length }}
            </span>
          </div> -->
          <div
            class="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer"
            @click="select_all()"
          >
            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                :checked="
                  selected_members.length === FILTERED_CONVERSATION.length
                "
                class="h-4 w-4 text-blue-600 flex-shrink-0"
              />

              <div>
                <p class="text-sm font-medium flex items-center gap-1">
                  <span
                    class="flex text-xs justify-center items-center flex-shrink-0 h-5 rounded-full p-1 bg-blue-50 text-blue-700"
                  >
                    {{ $t('v1.common.select_all') }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- List conversation -->
          <div
            class="flex flex-col overflow-y-auto border-t border-slate-200 pt-2 h-full"
          >
            <div
              v-for="(conv, index) in FILTERED_CONVERSATION"
              :key="conv.fb_client_id + '_' + conv.fb_page_id"
              class="flex items-center justify-between p-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              @click="toggleMember(conv)"
            >
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  :checked="selected_members.includes(conv)"
                  class="h-4 w-4 text-blue-600 flex-shrink-0"
                />
                <!-- <img
                  :src="conv.client_avatar"
                  alt=""
                  class="size-10 rounded-full"
                /> -->
                <ClientAvatar :source="conv" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1">
                    <span
                      class="flex text-xs justify-center items-center flex-shrink-0 h-5 rounded-full p-1 bg-blue-50 text-blue-700"
                    >
                      {{ index + 1 }}
                    </span>
                    <p class="text-sm font-medium truncate">
                      {{ conv.client_name }}
                    </p>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-1">
                    {{ conv.last_message || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="FILTERED_CONVERSATION.length === 0"
              class="p-2 text-slate-400 text-sm"
            >
              {{ $t('v1.common.no_data') }}
            </div>
          </div>

          <div class="flex flex-col gap-2 text-sm">
            <div>
              {{ $t('v1.common.sharing_content') }}:
              <span
                v-if="sending_media.length > 0 && sending_media?.[0].type"
                >{{ $t('v1.common.attachments') }}</span
              >
            </div>
            <div>
              <div>
                <textarea
                  v-model="sending_message"
                  class="w-full border border-slate-200 h-20 rounded-md p-2 placeholder-slate-500"
                  :placeholder="$t('v1.common.enter_sharing_content')"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="bg-white h-full w-1/2 rounded-md p-2 flex flex-col justify-between"
        >
          <!-- Selected info -->
          <div
            class="flex w-full gap-2 items-center justify-between text-xs pb-2"
          >
            <span
              v-if="selected_members.length > 0"
              class="flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 text-sm font-semibold rounded-md"
            >
              {{ $t('v1.common.member_selected') }}
              {{ selected_members.length }}
              <span>
                <XMarkIcon
                  @click="selected_members = []"
                  v-if="selected_members.length > 0"
                  class="size-5 text-red-500 cursor-pointer"
                />
              </span>
            </span>
          </div>

          <!-- List conversation -->
          <div class="flex flex-col overflow-y-auto py-2 h-full">
            <div
              v-for="conv in selected_members"
              :key="conv.fb_client_id + '_' + conv.fb_page_id"
              class="flex items-center justify-between p-2 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
              @click="toggleMember(conv)"
            >
              <div class="flex items-center gap-4">
                <input
                  type="checkbox"
                  :checked="selected_members.includes(conv)"
                  class="h-4 w-4 text-blue-600 flex-shrink-0"
                />

                <ClientAvatar :source="conv" />
                <div>
                  <p class="text-sm font-medium line-clamp-1">
                    {{ conv.client_name }}
                  </p>
                  <p class="text-xs text-slate-500 line-clamp-1">
                    {{ conv.last_message || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="FILTERED_CONVERSATION.length === 0"
              class="p-2 text-slate-400 text-sm"
            >
              {{ $t('v1.common.no_data') }}
            </div>
          </div>

          <!-- Selected info -->
          <div
            class="flex w-full gap-2 items-center justify-center text-xs w-full pt-2"
          >
            <button
              @click="shareMessage()"
              class="py-2 px-4 font-medium text-base rounded-md"
              :class="[
                selected_members.length === 0
                  ? 'cursor-not-allowed opacity-50 bg-slate-200 text-slate-500 border border-slate-200'
                  : 'cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-100 hover:border-blue-200',
              ]"
              :disabled="selected_members.length === 0"
            >
              {{ $t('v1.common.share_to') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { container } from 'tsyringe'
import { computed, ref, watch } from 'vue'

import Modal from '@/components/Modal.vue'
import type {
  FilterConversation,
  QueryConversationResponse,
} from '@/service/interface/app/conversation'
import {
  useConversationStore,
  useMessageStore,
  useOrgStore,
  usePageStore,
} from '@/stores'
import { N13ZaloPersonal } from '@/utils/api/N13ZaloPersonal'
import {
  N4SerivceAppConversation,
  N4SerivceAppMessage,
} from '@/utils/api/N4Service/Conversation'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { keys } from 'lodash'

import ClientAvatar from '@/views/ChatWarper/Chat/LeftBar/Conversation/ClientAvatar.vue'
import { storeToRefs } from 'pinia'
import type {
  AttachmentInfo,
  MessageInfo,
} from '@/service/interface/app/message'

/** Stores quản lý org và page */
const orgStore = useOrgStore()
const pageStore = usePageStore()
const conversationStore = useConversationStore()
const { message_data } = storeToRefs(useMessageStore())
const API_MESSAGE = container.resolve(N4SerivceAppMessage)

const sending_media = ref<AttachmentInfo[]>([])

const sending_message = ref<string>('')

watch(
  () => message_data.value,
  newVal => {
    console.log('newVal', newVal)
    sending_message.value = newVal?.message_text || ''
    sending_media.value = newVal?.message_attachments || []
  }
)

/** UI state */
/** Tên group Zalo muốn tạo */
const group_name = ref('')
/** Từ khóa tìm kiếm conversation */
const search_conversation = ref<string>()
/** Ref tới component modal */
const modal_widget__group_share_ref = ref<InstanceType<typeof Modal>>()
/** View hiện tại: SEARCH, CHAT, FRIEND_REQUEST hoặc trống */
const view = ref<'SEARCH' | 'CHAT' | 'FRIEND_REQUEST' | ''>('')
/** Cờ kiểm tra modal đang mở */
const is_modal_open = ref(false)

/** Conversation data */
/** Danh sách conversation đang hiển thị */
const conversations = ref<any[]>([])
/** Danh sách thành viên được chọn để tạo group */
const selected_members = ref<any[]>([])
/** Tổng số conversation */
const count_conversation = ref<number>(0)
/** Cursor cho paging conversation */
const after_cursor = ref<number[] | undefined>(undefined)
/** Cờ kiểm tra đang fetch conversation */
const is_fetching = ref(false)

/** Validation */
/** Kiểm tra lỗi tên group */
const error_group_name = ref(false)
/** Kiểm tra lỗi chọn thành viên */
const error_select_members = ref('')

/** Khởi tạo trực tiếp instance API Zalo */
const API_ZALO = new N13ZaloPersonal('app/page/group')

/**
 * @class Main
 * @description Chứa logic gọi API conversation, KHÔNG chứa store
 */
class Main {
  /**
   * @param API instance N4ServiceAppConversation
   */
  constructor(
    private readonly API = container.resolve(N4SerivceAppConversation)
  ) {}

  /**
   * Bật/tắt modal, nếu mở modal sẽ fetch toàn bộ conversation
   */
  toggleModal() {
    modal_widget__group_share_ref.value?.toggleModal()
    is_modal_open.value = !is_modal_open.value
    if (is_modal_open.value) {
      fetchAllConversations()
    } else {
      selected_members.value = []
      search_conversation.value = ''
      group_name.value = ''
    }
  }

  /**
   * Lấy conversation từ server
   * @param params - object chứa pageIds, orgId, filter, limit, sort, after
   * @returns kết quả bao gồm result[], after cursor, count
   */
  async getConversation(params: {
    page_ids: string[]
    org_id: string
    filter: FilterConversation
    limit: number
    sort: string
    after?: number[] | undefined
  }) {
    try {
      return await this.API.readConversations(
        params.page_ids,
        params.org_id,
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

  /**
   * Lấy tổng số conversation theo filter
   * @param params object chứa pageIds và filter
   * @returns object { count }
   */
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

/**
 * Fetch toàn bộ conversation theo cursor (paging)
 * Sử dụng while loop để fetch tới khi hết dữ liệu
 */
async function fetchAllConversations() {
  /** Nếu đang fetch thì return */
  if (is_fetching.value) return
  is_fetching.value = true
  /** Lấy page id theo conversation đang được chọn */
  const CURRENT_PAGE_ID = conversationStore?.select_conversation?.fb_page_id
  /** Lấy tất cả page_id đang chọn */
  const PAGE_IDS = keys(pageStore.selected_page_id_list)
  /** Filter mặc định */
  const FILTER: FilterConversation = {
    conversation_type: 'CHAT',
    is_spam_fb: 'NO',
  }
  /** Sắp xếp theo số lượng unread, sau đó thời gian tin nhắn cuối */
  const SORT = 'unread_message_amount:desc,last_message_time:desc'

  /** Reset dữ liệu trước khi fetch */
  conversations.value = []
  selected_members.value = []
  after_cursor.value = undefined
  /** Tạo trạng thái fetching = true */
  let keep_fetching = true
  while (keep_fetching) {
    /** Gọi API để fetch conversation */
    const RES: QueryConversationResponse | any = await $main.getConversation({
      page_ids: [CURRENT_PAGE_ID || ''],
      org_id: orgStore.selected_org_id || '',
      filter: FILTER,
      limit: 50,
      sort: SORT,
      after: after_cursor.value || undefined,
    })

    /** Nếu có dữ liệu, push vào list và update cursor */
    if (RES?.result?.length) {
      conversations.value.push(...RES.result)
      after_cursor.value = RES.after || undefined
      // keep_fetching = !!after_cursor.value
      keep_fetching = false
    } else {
      /** Nếu không có dữ liệu nữa thì dừng loop */
      keep_fetching = false
    }

    count_conversation.value = RES?.count || conversations.value.length
  }

  /** Reset cờ fetch */
  is_fetching.value = false
}

/**
 * Computed filter conversation theo từ khóa name hoặc phone
 */
const FILTERED_CONVERSATION = computed(() => {
  /** Nếu không có key word thì trả về cả list */
  if (!search_conversation.value) return conversations.value
  /** Xử lý to lowercase */
  const KEYWORD = search_conversation.value.toLowerCase()
  /** Xử lý filter conversation phone và name */
  return conversations.value.filter(
    conv =>
      (conv.client_name || '').toLowerCase().includes(KEYWORD) ||
      (conv.client_phone || '').includes(KEYWORD)
  )
})

/**
 * Xử lý tạo group trên Zalo
 */
async function shareMessage() {
  /** Lấy page_id mặc định (page đầu tiên) */
  const PAGE_IDS = keys(pageStore.selected_page_id_list)
  const page_id = PAGE_IDS[0] || ''
  /** Lấy list page */
  const LIST = orgStore.list_os || []
  /** lấy page trùng với page hiện tại */
  const PAGE = LIST.find(p => p.page_id === page_id)

  /** Lặp qua danh sách thành viên đã chọn */
  for (const member of selected_members.value) {
    try {
      /** Gọi API gửi tin nhắn */
      await API_MESSAGE.sendMessage(
        page_id,
        member.fb_client_id,
        sending_message.value || '',
        PAGE?.org_id || ''
      )
    } catch (err) {
      console.error('Lỗi khi chia sẻ tin nhắn:', err)
    }
  }

  /** Reset UI sau khi gửi thành công */
  modal_widget__group_share_ref.value?.toggleModal()
  selected_members.value = []
}

/**
 * Thêm/xóa thành viên trong danh sách selected_members
 * @param conv conversation object
 */
function toggleMember(conv: any) {
  /** Reset lỗi */
  error_select_members.value = ''

  /** Tìm index thành viên đã chọn */
  const INDEX = selected_members.value.findIndex(
    m =>
      m.fb_client_id === conv.fb_client_id && m.fb_page_id === conv.fb_page_id
  )

  /** Nếu đã chọn, xóa; nếu chưa chọn, push vào mảng */
  if (INDEX >= 0) {
    selected_members.value.splice(INDEX, 1)
  } else {
    selected_members.value.push(conv)
  }
}

/**
 * Chọn tất cả thành viên
 */
function select_all() {
  /** Nếu đang chọn tất cả thì reset */
  if (selected_members.value?.length === FILTERED_CONVERSATION.value.length) {
    selected_members.value = []
    return
  }
  /** Nếu chưa chọn tất cả thì chọn tất cả */
  selected_members.value = [...FILTERED_CONVERSATION.value]
}

/** Expose toggleModal ra component cha để gọi trực tiếp */
defineExpose({ toggleModal: $main.toggleModal.bind($main) })
</script>
