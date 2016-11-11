<template lang="jade">
div
  div.row.middle-xs.height-75
    div.col-xs-10.col-xs-offset-1.col-sm-8.col-sm-offset-2.text-center
      //- h2 About
      h2 The Speckle Family is under development at #[a(href='http://www.bartlett.ucl.ac.uk/') The Bartlett School of Architcture UCL], within #[a(href='http://innochain.net') InnoChain].
      a(href='http://www.bartlett.ucl.ac.uk/')
        img(src='./assets/bartlett-ucl.png')
      a(href='http://innochain.net')
        img(src='./assets/innochainblack.png', style='margin-bottom:30px; margin-left:15px;')
      //- img(src='./assets/innochain.png')
      //- img(src='./assets/innochain.png')
  div.row.middle-xs.height-75.bg-moss
    div.col-xs-10.col-xs-offset-1.col-sm-8.col-sm-offset-2
      h2 Research
      p Speckle was born as a #[strong research instrument] aimed to study the communication patterns of design. Its aims are to provide a flexible platform for a democratic distribution of information amongst the expert systems involved in the production of the built environment. 
      div.row
        div.col-xs-6
          h4 Forged by:
          p Forged by #[a(href='http://twitter.com/idid') Dimitrie Stefanescu.]
        div.col-xs-6
          h4 Under the guidance of:
          p Sean Hanna, Robert Aish and Bob Sheil. 
  div.row.middle-xs.height-100
    div.col-xs-10.col-xs-offset-1.col-sm-8.col-sm-offset-2
      h2 Licence
      p Speckle Streams will be released under a permissive Open Source licence, so anyone can get it up and running for their own needs. There are some things that need ironing out before the release. If you have any thoughts or want to stay updated, #[a(v-link="{ path: '/contact' }") do get in touch.]
      h2 Service Agreement
      p Speckle is growing, and sometimes that's painful. Things might change - as such, everything is provided #[strong as-is]. 
  div.row.middle-xs.height-75.bg-moss
      div.col-xs-10.col-xs-offset-1.col-sm-8.col-sm-offset-2
        h2 The Defintion of Free
        p The service operates now under virtually no limits for users. In the near future, some limits will need to be enforced, depending on usage and resources available. 
        p Nevertheless, our aim is to make speckle easily deployable on your own infrastructure, so you can benefit form it to its fullest without being stuck. If you have any thoughts on what your corporate needs are and how they would shape Speckle up, #[a(v-link="{ path: '/contact' }") write us about it.]
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
  font-weight: 400;
}
a:hover{ 
  text-decoration: underline;
}
</style>
