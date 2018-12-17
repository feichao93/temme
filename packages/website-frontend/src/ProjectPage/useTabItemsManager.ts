import produce from 'immer'
import { useState } from 'react'
import { TabItem } from './tablists'

/** 管理选择器多标签页的相关状态 */
export default function useTabItemsManager() {
  const [items, update] = useState<TabItem[]>([])

  function clear() {
    update([])
  }

  function updateInitAvid(uriString: string, initAvid: number) {
    update(
      produce(list => {
        const targetItem = list.find(item => item.uriString === uriString)
        targetItem.initAvid = initAvid
      }),
    )
  }

  function updateAvid(uriString: string, avid: number) {
    update(
      produce(list => {
        const targetItem = list.find(item => item.uriString === uriString)
        targetItem.avid = avid
      }),
    )
  }

  function remove(index: number) {
    update(
      produce(list => {
        list.splice(index, 1)
      }),
    )
  }

  function add(uriString: string, name: string, avid: number) {
    update(
      produce(list => {
        list.push({ uriString, name, initAvid: avid, avid })
      }),
    )
  }

  return {
    items,
    add,
    remove,
    updateAvid,
    updateInitAvid,
    clear,
  }
}
