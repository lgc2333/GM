// ==UserScript==
// @name         MidiShowDownload
// @namespace    https://lgc2333.top/
// @version      0.1.0
// @description  MidiShow免积分下载
// @author       LgCookie
// @homepage     https://github.com/lgc2333/GM
// @match        https://www.midishow.com/midi/*
// @match        https://www.midishow.com/zh-tw/midi/*
// @match        https://www.midishow.com/en/midi/*
// @license      MIT
// @grant        GM_addStyle
// ==/UserScript==

/* global kBase sBase $ PNotify */

;(function () {
  'use strict'

  const name = 'MidiShowDownload'
  /** @type {Record<string, string>} */
  const fetchedDataUrls = {}

  /**
   * @param {string} hexString
   * @returns {string}
   */
  function decodeHexToString(hexString) {
    let decodedString = ''
    for (let i = 0; i < hexString.length; i += 2) {
      const hexPair = hexString.substring(i, i + 2)
      if (hexPair === '00') break
      decodedString += String.fromCharCode(Number.parseInt(hexPair, 16))
    }
    return decodedString
  }

  /**
   * @param {string} encoded
   * @param {string} key
   * @returns {string}
   */
  function midiShowDecode(encoded, key) {
    let result = ''
    for (let i = 0; i < encoded.length; ) {
      const char1_val = key.indexOf(encoded.charAt(i++))
      const char2_val = key.indexOf(encoded.charAt(i++))
      const char3_val = key.indexOf(encoded.charAt(i++))
      const char4_val = key.indexOf(encoded.charAt(i++))

      const byte1 = (char1_val << 2) | (char2_val >> 4)
      const byte2 = ((char2_val & 15) << 4) | (char3_val >> 2)
      const byte3 = ((char3_val & 3) << 6) | char4_val

      result += String.fromCharCode(byte1)
      if (char3_val !== 64) result += String.fromCharCode(byte2)
      if (char4_val !== 64) result += String.fromCharCode(byte3)
    }
    return result
  }

  /**
   * @param {string} str
   * @returns {Uint8Array}
   */
  function strDataToUint8Array(str) {
    const arr = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr
  }

  /**
   * @param {string} fileId
   * @param {string} fileMId
   * @returns {Promise<Blob | undefined>}
   */
  async function downloadMidi(fileId, fileMId) {
    const req1 = $.ajax({
      method: 'GET',
      url: fileMId
        .replace(/^tokeno#:@!/, 'token')
        .replace(kBase, sBase)
        .replace('.mid?', '.js?'),
      dataType: 'jsonp',
      cache: true,
      jsonp: false,
      jsonpCallback: 'e',
    })
    const req2 = $.ajax({
      method: 'POST',
      url: `${$.MS.langUrl('/midi/new-file')}?id=${fileId}`,
      dataType: 'text',
      data: { id: fileId },
    })

    /** @typedef {[string, JQuery.Ajax.SuccessTextStatus, JQuery.jqXHR]} Resp */
    const [[res1], [res2, , xhr2]] = /** @type {[Resp, Resp]} */ (
      await $.when(req1, req2).then((p1, p2) => [p1, p2])
    )

    const eTag = xhr2.getResponseHeader('ETag')
    if (!eTag) {
      PNotify.error({ title: name, text: '未找到 ETag' })
      return
    }
    const key = decodeHexToString(eTag) + res2.substring(56)
    const dataStr =
      midiShowDecode(res2.substring(28, 56), key) + // .substr(from: 28, length: 28)
      midiShowDecode(res1, key) +
      midiShowDecode(res2.substring(0, 28), key) // .substr(from: 0, length: 28)
    return new Blob([strDataToUint8Array(dataStr)], { type: 'audio/midi' })
  }

  /**
   * @param {string} url
   * @param {string} filename
   */
  function openSaveDialog(url, filename) {
    const el = document.createElement('a')
    el.href = url
    el.download = filename
    el.target = '_blank'
    el.click()
  }

  async function saveCurrentMidi() {
    const el = /** @type {HTMLDivElement | null} */ (
      document.querySelector('.ms-player-container[data-id][data-mid]')
    )
    if (!el) {
      PNotify.error({ title: name, text: '找不到播放器' })
      return
    }
    const fileId = /** @type {string} */ (el.dataset.id)

    let url = fetchedDataUrls[fileId]
    if (!url) {
      const fileMId = /** @type {string} */ (el.dataset.mid)
      const blob = await downloadMidi(fileId, fileMId)
      if (!blob) return
      url = URL.createObjectURL(blob)
      fetchedDataUrls[fileId] = url
    }

    const filenameEl = /** @type {HTMLHeadingElement | null} */ (
      el.querySelector('h1.pl-md-player')
    )
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    const fileBaseName = filenameEl ? `${fileId} - ${filenameEl.innerText}` : fileId
    openSaveDialog(url, fileBaseName)
  }

  window.addEventListener('load', () => {
    const downloadArea = /** @type {HTMLDivElement | null} */ (
      document.getElementById('download')
    )
    const originalDownBtn = downloadArea?.firstElementChild
    if (!originalDownBtn) {
      PNotify.error({ title: name, text: '添加下载按钮失败：定位不到目标元素' })
      return
    }

    GM_addStyle(`a.btn.btn-primary.disabled { filter: grayscale(1); }`)
    const btnHtml =
      `<a class="btn btn-primary btn-sm mb-3 mr-2" href="javascript:void">` +
      `<span class="fa fa-download"></span> ${name}` +
      `</a>`
    originalDownBtn.insertAdjacentHTML('afterend', btnHtml)

    const btn = /** @type {HTMLAnchorElement} */ (originalDownBtn.nextElementSibling)
    btn.addEventListener('click', async () => {
      if (btn.classList.contains('disabled')) return
      btn.classList.add('disabled')
      try {
        await saveCurrentMidi()
      } catch (e) {
        PNotify.error({ title: name, text: `出现意外错误\n${e}` })
      }
      btn.classList.remove('disabled')
    })
  })

  window.addEventListener('beforeunload', () => {
    Object.values(fetchedDataUrls).forEach((v) => URL.revokeObjectURL(v))
  })
})()
