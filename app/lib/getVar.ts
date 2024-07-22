'use client'
export function GetVar(name: string) {
  if (typeof window === 'undefined') {
    return 'This function is only available on the client side'
  }
  return localStorage.getItem(name) ?? process.env[varDefine[name].envKey] ?? varDefine[name].defaultValue
}

const varDefine: {
  [localStorageKey: string]: {
    envKey: string
    defaultValue: string
  }
} = {
  STORAGE: {
    envKey: 'NEXT_PUBLIC_DEFAULT_STORAGE',
    defaultValue: 'file0',
  },
  UPLOAD_PW: {
    envKey: 'NEXT_PUBLIC_DEFAULT_UPLOAD_PW',
    defaultValue: '',
  },
  DOWNLOAD_PW: {
    envKey: 'NEXT_PUBLIC_DEFAULT_DOWNLOAD_PW',
    defaultValue: '',
  },
  SERVER: {
    envKey: 'NEXT_PUBLIC_DEFAULT_SERVER',
    defaultValue: '',
  },
}
