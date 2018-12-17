import produce from 'immer'
import { useState } from 'react'
import { TabItem } from './tablists'

export interface TabManagerState {
  activeIndex: number
  items: TabItem[]
}

/** 管理选择器多标签页的相关状态 */
export default function useTabManager() {
  const [{ activeIndex, items }, update] = useState<TabManagerState>({ activeIndex: -1, items: [] })

  function clear() {
    update(
      produce(state => {
        state.items = []
        state.activeIndex = -1
      }),
    )
  }

  function updateActiveInitAvid(initAvid: number) {
    update(
      produce(state => {
        state.items[state.activeIndex].initAvid = initAvid
      }),
    )
  }

  function updateActiveAvid(avid: number) {
    update(
      produce(state => {
        state.items[state.activeIndex].avid = avid
      }),
    )
  }

  function remove(index: number) {
    update(
      produce(state => {
        state.items.splice(index, 1)
      }),
    )
  }

  function add(uri: string, name: string, avid: number) {
    update(
      produce(state => {
        state.items.push({ uri, name, initAvid: avid, avid })
      }),
    )
  }

  function setActiveUri(uri: string) {
    update(
      produce(state => {
        state.activeIndex = state.items.findIndex(item => item.uri === uri)
      }),
    )
  }

  const activeItem = items[activeIndex]
  const activeTabName = activeItem && activeItem.name
  const activeUri = activeItem && activeItem.uri

  return {
    items,
    add,
    remove,
    updateActiveAvid,
    updateActiveInitAvid,
    clear,
    activeIndex,
    setActiveUri,
    activeItem,
    activeTabName,
    activeUri,
  }
}
