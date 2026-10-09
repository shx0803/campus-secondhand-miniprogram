Component({
  options: {
    addGlobalClass: true
  },

  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '搜索你想买的闲置好物'
    },
    /** 只读模式：仅作为入口，点击触发 tap 事件 */
    readonly: {
      type: Boolean,
      value: false
    },
    /** 是否自动聚焦（搜索页使用） */
    focus: {
      type: Boolean,
      value: false
    },
    /** 外观：light（半透明白） / gray（页面灰底） */
    theme: {
      type: String,
      value: 'light'
    }
  },

  methods: {
    onInput(e) {
      this.triggerEvent('valuechange', { value: e.detail.value });
    },

    onConfirm(e) {
      this.triggerEvent('searchconfirm', { value: e.detail.value });
    },

    onTap() {
      if (this.data.readonly) {
        this.triggerEvent('enterpress');
      }
    },

    onClear() {
      this.triggerEvent('valuechange', { value: '' });
    }
  }
});