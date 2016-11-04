function auth (sync, host, credentials, callback) {
  if (!sync.options.auth) {
    sync.authenticated = true
    callback()
    return
  }

  sync.authenticating = true
  sync.options.auth(credentials, host).then(function (access) {
    if (access) {
      sync.authenticated = true
      sync.authenticating = false

      callback()
      for (var i = 0; i < sync.unauthenticated.length; i++) {
        sync.onMessage(sync.unauthenticated[i])
      }
      sync.unauthenticated = []
    } else {
      sync.sendError('wrong-credentials')
      sync.destroy()
    }
  })
}

module.exports = {

  sendConnect: function sendConnect () {
    var message = ['connect', this.protocol, this.host, this.otherSynced]
    if (this.options.credentials) {
      message.push({ credentials: this.options.credentials })
    }
    if (this.options.fixTime) this.connectSended = this.log.timer()[0]
    if (this.log.lastAdded > this.synced) this.setState('sending')
    this.startTimeout()
    this.send(message)
  },

  sendConnected: function sendConnected (start, end) {
    var message = ['connected', this.protocol, this.host, [start, end]]
    if (this.options.credentials) {
      message.push({ credentials: this.options.credentials })
    }
    this.send(message)
  },

  connectMessage: function connectMessage (version, host, synced, options) {
    if (!options) options = { }

    this.otherHost = host
    this.otherProtocol = version

    var major = this.protocol[0]
    if (major !== version[0]) {
      this.sendError('wrong-protocol', { supported: [major], used: version })
      this.destroy()
      return
    }

    var sync = this
    var start = this.log.timer()[0]
    auth(this, host, options.credentials, function () {
      sync.sendConnected(start, sync.log.timer()[0])
      sync.syncSince(synced)
    })
  },

  connectedMessage: function connectedMessage (version, host, time, options) {
    if (!options) options = { }

    this.endTimeout()
    this.otherHost = host
    this.otherProtocol = version

    if (this.options.fixTime) {
      var now = this.log.timer()[0]
      var authTime = time[1] - time[0]
      var roundTrip = now - this.connectSended - authTime
      this.timeFix = this.connectSended - time[0] + roundTrip / 2
    }

    var sync = this
    auth(this, host, options.credentials, function () {
      sync.syncSince(sync.synced)
    })
  }

}
