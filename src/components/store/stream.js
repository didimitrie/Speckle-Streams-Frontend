// import Vue  from 'vue'
import _    from 'underscore'
import Bus  from '../logic/Events'

export default {
  // the actual values
  id: null,
  streamid: null,
  ownerid: null,
  name: null,
  droplets: [],
  consolidatedStructure: [],

  // actions, mutations or whatever you wanna call them shits
  // i finally think i grok the flux store architecture
  setStream( stream ) {
    this.livedroplet = stream.livedroplet
    this.droplets = stream.droplets
    this.consolidatedStructure = stream.consolidatedStructure
    this.name = stream.name
    this.id = stream._id
    this.streamid = stream.streamid
    this.ownerid = stream.ownerid
  },
  
  updateConsolidatedStructure( guid, props ) {
    let layer = _.findWhere( this.consolidatedStructure, { guid: guid })
    if(!layer) return console.error('This should really not fucking happen')
    layer.visible = props.visible
    layer.expanded = props.expanded
    layer.colors = props.colors
    this.debouncedUpdate()
  },
  debouncedUpdate: _.debounce( function(){ Bus.$emit('update-stream-structure') }, 500 )
}