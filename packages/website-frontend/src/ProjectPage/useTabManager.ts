import produce from 'immer'
import { useState } from 'react'
import { TabItem } from './tablists'
import { getSelectorUri } from './utils'

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

  function updateInitAvid(uri: string, initAvid: number) {
    update(
      produce(state => {
        const item = state.items.find(item => item.uri === uri)
        item.initAvid = initAvid
      }),
    )
  }
  function findNext(selectorName: string) {
    if (items.length === 1) return null
    const index = items.findIndex(item => item.name === selectorName)
    return index === 0 ? items[1].name : items[index - 1].name
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
  function updateTabName(pageId: number, oldName: string, newName: string) {
    update(
      produce(state => {
        const item = state.items.find(item => item.name === oldName)
        item.name = newName
        item.uri = getSelectorUri(pageId, newName)
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
    updateInitAvid,
    clear,
    activeIndex,
    setActiveUri,
    activeItem,
    activeTabName,
    activeUri,
    updateTabName,
    findNext,
  }
}
