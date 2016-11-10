export function getCurrentUserMessages(context) {
  const store = context.container.lookup('store:main'),
        username = context.currentUser.get('username');

  return store.findFiltered("topicList", {filter: "topics/private-messages/" + username}).then((result) => {
    let inbox = result.topics,
        inboxIds = result.topics.map(function(topic) {return topic.id});

    return store.findFiltered("topicList", {filter: "topics/private-messages-sent/" + username}).then((result) => {
      let sentOnly = result.topics.filter(function(topic) {return inboxIds.indexOf(topic.id) === -1}),
          messages = inbox.concat(sentOnly);

      messages.sort(function(a, b) {
        a = new Date(a.last_posted_at);
        b = new Date(b.last_posted_at);
        return a > b ? -1 : a < b ? 1 : 0;
      });

      messages = messages.filter(function(m) {
        return m.subtype == 'user_to_user'
      });

      return messages
    }).catch(() => {
      console.log('getting sent messages failed')
      return [];
    })
  }).catch(() => {
    console.log('getting inbox failed')
    return [];
  })
}

export function getCurrentUserMessageCount(context, docked) {
  const store = context.container.lookup('store:main'),
        username = context.currentUser.get('username');

  return store.findFiltered("topicList", {filter: "topics/private-messages/" + username}).then((result) => {
    console.log(result.topics)
    let unreadMessages = result.topics.filter((m) => {
      return m.subtype === 'user_to_user' && m.last_read_post_number < m.highest_post_number && docked.indexOf(m.id) === -1
    })

    let unreadCount = 0
    unreadMessages.forEach((m) => {
      unreadCount += m.highest_post_number - m.last_read_post_number
    })

    return unreadCount
  })
}
