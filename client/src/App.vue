<template>
  <v-app>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
    </v-toolbar>
    <v-content>
      <Login/>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>Cédric & Nicolas &copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
import Login from './components/Login'

export default {
  name: 'App',
  components: {
    Login
  },
  data () {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [{
        icon: 'bubble_chart',
        title: 'Inspire'
      }],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  }
}
</script>
