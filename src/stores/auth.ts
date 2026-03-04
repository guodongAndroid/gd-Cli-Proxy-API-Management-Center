import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '../lib/request'
import { configApi } from '../api/config'
import { useConfigStore } from './config'
import { useUsageStore } from './usage'
import { useQuotaStore } from './quota'

export const useAuthStore = defineStore('auth', () => {
  const isConnected = ref(false)
  const restoring = ref(false)
  const apiUrl = ref(localStorage.getItem('apiUrl') || '')
  const managementKey = ref(localStorage.getItem('managementKey') || '')

  let unauthorizedFired = false
  request.setUnauthorizedHandler(() => {
    if (unauthorizedFired) return
    unauthorizedFired = true
    disconnect()
    setTimeout(() => {
      unauthorizedFired = false
    }, 1000)
  })

  const connect = async (url: string, key: string) => {
    request.initialize(url, key)

    try {
      await configApi.getConfig()

      apiUrl.value = url
      managementKey.value = key
      isConnected.value = true

      localStorage.setItem('apiUrl', url)
      localStorage.setItem('managementKey', key)

      return true
    } catch (error: any) {
      isConnected.value = false
      throw error
    }
  }

  const disconnect = () => {
    isConnected.value = false
    localStorage.removeItem('apiUrl')
    localStorage.removeItem('managementKey')

    useConfigStore().invalidateProviders()
    useUsageStore().clearData()
    useQuotaStore().clearAll()
  }

  if (apiUrl.value && managementKey.value) {
    restoring.value = true
    connect(apiUrl.value, managementKey.value)
      .catch(() => {
        console.warn('Failed to restore connection')
        localStorage.removeItem('apiUrl')
        localStorage.removeItem('managementKey')
        apiUrl.value = ''
        managementKey.value = ''
      })
      .finally(() => {
        restoring.value = false
      })
  }

  return {
    isConnected,
    restoring,
    apiUrl,
    managementKey,
    connect,
    disconnect
  }
})
