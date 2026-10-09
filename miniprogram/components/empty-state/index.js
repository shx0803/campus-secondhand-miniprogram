Component({
  options: {
    addGlobalClass: true
  },

  properties: {
    /** 顶部图形符号 */
    icon: {
      type: String,
      value: '📭'
    },
    text: {
      type: String,
      value: '这里还什么都没有'
    },
    /** 可选操作按钮文案 */
    actionText: {
      type: String,
      value: ''
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});