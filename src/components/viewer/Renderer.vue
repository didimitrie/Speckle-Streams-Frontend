<template lang="jade">
div
  div.canvas(v-el:canvas)
  div.made-with.hidden-xs #[a(href='http://streams.speckle.xyz', target='_blank') Made with Speckle! ]

</template>

<script>
import _                  from 'underscore'
import FileSaver          from 'file-saver'
import THREE              from 'three'
import OrbitControlsDef   from 'three-orbit-controls'
import StlExporter        from 'three-stlexporter'
import TWEEN              from 'tween.js'
import Converter          from '../logic/Converter'

import Store              from '../../config'
import GeoStore           from '../store/molecules'
import Droplets           from '../store/droplets'
import StreamStore        from '../store/stream'
import Sections           from '../store/sections'

import Bus                from '../logic/Events'

export default {
  props:['live'],
  data() {
    return {
      shared: Store,
      DropletStore: Droplets,
      StreamStore: StreamStore,
      Sections: Sections,
      SceneBoundingSphere: null,
      toLoad: 0,
      loaded: -1,
      firstLiveUpdate: true,
      diffDebounce: _.debounce( this.diffScene, 1000 ),
      firstLoad: true,
      embed: false
    }
  },
  computed: {
    percLoaded() {
      if(this.loaded == -1 || this.toLoad == 0 ) return 100
      return this.loaded /  this.toLoad * 100
    },
    showProgress(){
      if( this.loaded == -1 || this.toLoad == 0 ) return false
      if( this.loaded == this.toLoad ) return false
      return true
    }
  },
  methods: {
    initialize() {
      // console.info('render inits')
      this.renderer = new THREE.WebGLRenderer( { alpha: false, antialias: true,    preserveDrawingBuffer: true } )
      this.scene = new THREE.Scene()
      this.parsedObjects = []
      this.gridHelper = null

      // this.scene.fog = new THREE.FogExp2( new THREE.Color('#DDDDDD'), 0.0003 );
      // camera + renderer
      this.renderer.setSize( this.$els.canvas.offsetWidth, this.$els.canvas.offsetHeight )
      this.renderer.setClearColor(new THREE.Color('#FFFFFF'), 1.0)
      this.$els.canvas.appendChild( this.renderer.domElement )

      // this.globalPlane = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 10.1 );
      // this.renderer.clippingPlanes = [ this.globalPlane ]

      this.camera = new THREE.PerspectiveCamera(50, this.$els.canvas.offsetWidth/this.$els.canvas.offsetHeight, 1, 100000)
      this.camera.position.z = 500;    
      this.camera.position.y = 1000;  
        
      // what a hack
      this.OrbitControls = OrbitControlsDef( THREE )
      this.controls = new this.OrbitControls( this.camera, this.renderer.domElement)
      this.controls.enableZoom = window === window.top

      this.initContext()
      this.render()
    },

    initContext() {
      // let light = new THREE.SpotLight( 0xffffff, 0.05, 0, Math.PI / 2 );
      // light.position.set( 0, 1500, 1000 );
      // light.target.position.set( 0, 0, 0 );
      // this.scene.add( light );  

      let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
      hemiLight.color = new THREE.Color('#FFFFFF')
      hemiLight.groundColor = new THREE.Color('#959595')
      hemiLight.position.set( 0, 500, 0 );
      this.scene.add( hemiLight );

      let flashlight = new THREE.PointLight( new THREE.Color('#FFFFFF'), 0.12, 0, 1 )
      // flashlight.position.set(0,0,1)
      this.scene.add(this.camera)
      this.camera.add( flashlight )

      var size = 1000;
      var step = 50;

      this.gridHelper = new THREE.GridHelper( size, step, new THREE.Color("#BBBBBB"), new THREE.Color("#EDEDED") );
      this.scene.add( this.gridHelper );
      
      this.pl1 = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 0 );
      this.pl2 = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
      this.pl3 = new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), 0 );
      // // this.gridHelper.children.push( this.globalPlane )
      // this.renderer.clippingPlanes = [ this.globalPlane1, this.globalPlane2, this.globalPlane3 ]
      window.THREE = THREE
      window.scene = this.scene
      // window.renderer = this.renderer
    },

    getBoundingSphere( objs, cb) {
      let geometry = []
      let visibleObjs = new THREE.Geometry()
      let okpass = false

      if( objs && objs.length > 0 ) {
        // so we're looking for some objects
        geometry = objs
        for(let hash of geometry) {
        let myObj = _.findWhere( this.parsedObjects, {hash: hash.hash ? hash.hash : hash})
        if( myObj && myObj.visible ) {
          visibleObjs.merge( myObj.geometry )
          okpass = true
          }
        }
        if( !okpass ) return null
        visibleObjs.computeBoundingSphere()
        let sphere = visibleObjs.boundingSphere
        visibleObjs.dispose()
        if(cb) cb(sphere)
        return sphere
      }
      else {
        // we're just getting the bbox of all the scene
        geometry = this.parsedObjects
        for( let obj of this.parsedObjects ) {
          if( obj.visible ) { visibleObjs.merge( obj.geometry ); okpass = true }
        }
        if(! okpass) return null
        visibleObjs.computeBoundingSphere()
        let sph = visibleObjs.boundingSphere
        visibleObjs.dispose()
        if(cb) cb(sph)
        return sph
      }
    },

    setCamera( where, duration ) {
      let self = this
      //position
      new TWEEN.Tween( self.camera.position ).to( { x: where.position.x, y: where.position.y, z: where.position.z }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start()
      // rotation
      new TWEEN.Tween( self.camera.rotation ).to( { x: where.rotation.x, y: where.rotation.y, z: where.rotation.z }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start()
      // controls center
      new TWEEN.Tween( self.controls.center ).to( { x: where.controlCenter.x, y: where.controlCenter.y, z: where.controlCenter.z }, duration ).onUpdate(()=>{ 
          self.controls.update();
          if( this.x === where.controlCenter.x )
            console.log('camera finished stuff')
        }).easing( TWEEN.Easing.Quadratic.InOut ).start()
    },

    zoomExtents( objs ) {
      this.getBoundingSphere( objs, ( boundingSphere ) => {
        if( !boundingSphere ) return console.log('error, sphere does not exist')
        if( boundingSphere.radius <= 0.01 ) return console.log('error, spehere radius is 0')

        let r = boundingSphere.radius
        let offset = r / Math.tan( Math.PI / 180 * this.controls.object.fov * 0.4 )
        let vector = new THREE.Vector3(0, 0, 1)
        let dir = vector.applyQuaternion( this.controls.object.quaternion )
        let newPos = new THREE.Vector3()
        dir.multiplyScalar( offset * 1.05 )
        newPos.addVectors( boundingSphere.center, dir )

        let futureLocation = {} 
        futureLocation.position = newPos
        futureLocation.rotation = this.controls.object.rotation.clone()
        futureLocation.controlCenter = boundingSphere.center.clone() 

        this.setCamera( futureLocation, 600 )
      } ) 
    },

    addObjectToScene ( obj, hash) {
      obj.hash = hash
      this.parsedObjects.push( obj )
      this.scene.add( obj )
    },

    applyStyles ( obj, layerguid ) { 
      let layer = _.findWhere( this.StreamStore.consolidatedStructure, { guid: layerguid } )
      // let layer = null
      if(!layer ) console.error('THIS should not happen. NO friggin layer????')
      obj.material.color = new THREE.Color( layer ? layer.colors.hex : '#A5A5A5' )
      // if(obj.children[0])
      //   obj.children[0].material.color = new THREE.Color( layer ? layer.colors.hex : '#A5A5A5' )
      obj.visible =  true // default to true
      obj.material.targetOpacity = layer ? layer.colors.a : 1  

      if( obj.material.opacity != obj.material.targetOpacity) {
        obj.material.opacity = 0
        this.fadeToObject( obj, obj.material.targetOpacity, 150 )
      }
    },

    fadeToObject( obj, opacity, time) {
      let duration = time ? time : 300
      let hide = opacity === 0 ? true : false
      let tweenIn = new TWEEN.Tween( { x : obj.material.opacity } )
      .to( { x: opacity }, duration )
      .onUpdate( function() {
        obj.material.opacity = this.x
        if( hide && this.x === 0) 
          obj.visible = false
      })

      tweenIn.start()
    },

    loadProgressIncrement() {
      this.loaded++
      // console.log(this.loaded + ' / ' + this.toLoad )
      if( this.loaded === this.toLoad ) {
        // Bus.$emit('zoom-objects', null)
        console.log('GEOMETRY LOAD FINISHED: ' + this.loaded + ' / ' + this.toLoad)
        Bus.$emit('hide-progress-bar', null)
        if( this.firstLoad ) {
          let self = this
          this.firstLoad = false
          setTimeout( self.zoomExtents, 250 )
          setTimeout( self.takeScreenShot, 1000 )
        }
      }
    },

    diffScene ( objectList ) { 
      // console.log("DIFFING SCENE! " + objectList.length)
      let self = this
      if(!objectList) return
      self.toLoad = objectList.length
      self.loaded = 0
      // for all the objects to load check if they are already in the parsed objects list
      for( let myobj of objectList ) {
        // console.log('Trying to add to scene: ' + myobj.hash)
        let found = _.findWhere( this.parsedObjects, { hash: myobj.hash })
        // if he is not there, convert him and add him to the scene
        if(!found) {
          // console.log('Not in scene.')
          if( myobj.value ) // POSSIBLE FUCKUP! DO THEY ALWAYS HAVE A VALUE??? SOMETIMES JUST DISPLAY VALUE?????!!!!!
          { // if he already has a value (comes from live update, then just convert it)
            // console.log('He already has a value (must be coming form live update). This is outdated')
            self.loadProgressIncrement()
            // console.log( myObj )
            Converter.getThreeObject( myobj, ( obj ) => {
                // ADD OBJECT TO SCENE
                self.addObjectToScene( obj, myobj.hash )
                self.applyStyles( obj, myobj.layerguid )
              })
          } 
          else { // otherwise request the molecule from the cache or db
            let found = _.findWhere( self.GeoStore.molecules, { hash: myobj.hash} )
            if( found ) 
            { // found in cache
              // console.log('Found him in the molecule cache')
              self.loadProgressIncrement()
              Converter.getThreeObject( found, (obj) => {
                // ADD OBJECT TO SCENE
                self.addObjectToScene(obj, found.hash )
                self.applyStyles( obj, myobj.layerguid )
              })
            }
            else { // not found in cache
              // console.log('Need to request him from server.')
              this.$http
                .get( window.SPKCONFIG.apiendpoint + '/api/frontend/molecule/', { params: { hash: myobj.hash } } )
                .then((response) => {
                  // console.log(response.data)
                  self.GeoStore.molecules.push( response.data.molecule.data )
                  Bus.$emit('hash-loaded', myobj.hash)
                  self.loadProgressIncrement()
                  Converter.getThreeObject( response.data.molecule.data, (obj) => { 
                    // console.log('Got him.')
                    // ADD OBJECT TO SCENE
                    self.addObjectToScene(obj, myobj.hash )
                    self.applyStyles( obj, myobj.layerguid )
                  })
                })
            }
          }
        }
        else { // actually he's here, let's just toggle his visibility to true
          // ADD OBJECT TO SCENE
          // console.log('Found in him in the scene already.')
          self.loadProgressIncrement()
          found.visible = true
          self.applyStyles( found, myobj.layerguid )
        }
      }

      // for all the parsed objects existing check if they are in the objects to load list, if they're not make them invisible
      for( let obj of this.parsedObjects ) {
        let jbo = _.findWhere( objectList , { hash: obj.hash })
        if( !jbo ) 
          self.fadeToObject(obj, 0, 120)
          // obj.visible = false
      }
    },

    toggleLayerVisibility( opts ) {
      // console.log(opts)
      for(obj of opts.objs) {
        let found = _.findWhere(this.parsedObjects, {hash: obj} )
        if( found ) found.visible = opts.visible
      }
    },

    render () {
      TWEEN.update()

      this.animationid = requestAnimationFrame( this.render )

      // this.scene.overrideMaterial = this.depthMaterial;
      // this.renderer.render( this.scene, this.camera, this.depthRenderTarget, false );
      // // Render renderPass and SSAO shaderPass
      // this.scene.overrideMaterial = null;
      // this.effectComposer.render();
    
      this.renderer.render( this.scene, this.camera )
    },

    resizeCanvas () {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( window.innerWidth, window.innerHeight );
    },

    mapNumber( num, in_min, in_max, out_min, out_max) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
    },

    takeScreenShot() {
      let img = this.renderer.domElement.toDataURL('img/png')
      Bus.$emit('save-screenshot', img)
    },

    downloadStl( name ) {
      let visibleScene = new THREE.Scene()
      for(let obj of this.parsedObjects) {
        if( obj.visible ) visibleScene.add( obj.clone() )
      }

      let exporter = new THREE.STLExporter();
      let stlString = exporter.parse( visibleScene );
      let blob = new Blob([stlString], {type: 'text/plain'});
      FileSaver.saveAs(blob, name + '.stl');
      visibleScene = null
    }
  },
  watch: {
    // HAMMERTIME
    'Sections.pl1'() {
      if( this.Sections.pl1 ){
        this.renderer.clippingPlanes.push( this.pl1 )
        this.SceneBoundingSphere = this.getBoundingSphere()
        this.pl1.constant = this.SceneBoundingSphere.center.x
      }
      else {
        let index = this.renderer.clippingPlanes.indexOf( this.pl1 )
        this.renderer.clippingPlanes.splice(index, 1)
      }
    },
    'Sections.pl1Flip'() {
      this.pl1.negate()
    },
    'Sections.pl1Value'() {
      if( !this.Sections.pl1 ) return
      this.pl1.constant = this.mapNumber( this.Sections.pl1Value, 0, 100, this.SceneBoundingSphere.center.x - this.SceneBoundingSphere.radius, this.SceneBoundingSphere.center.x + this.SceneBoundingSphere.radius )
    },
    'Sections.pl2'() {
      if( this.Sections.pl2 ){
        this.renderer.clippingPlanes.push( this.pl2 )
        this.SceneBoundingSphere = this.getBoundingSphere()
        this.pl2.constant = this.SceneBoundingSphere.center.y
      }
      else {
        let index = this.renderer.clippingPlanes.indexOf( this.pl2 )
        this.renderer.clippingPlanes.splice(index, 1)
      }
    },
    'Sections.pl2Flip'() {
      this.pl2.negate()
    },
    'Sections.pl2Value'() {
      if( !this.Sections.pl2 ) return
      this.pl2.constant = this.mapNumber( this.Sections.pl2Value, 0, 100, this.SceneBoundingSphere.center.y - this.SceneBoundingSphere.radius, this.SceneBoundingSphere.center.y + this.SceneBoundingSphere.radius )
    },
    'Sections.pl3'() {
      if( this.Sections.pl3 ){
        this.renderer.clippingPlanes.push( this.pl3 )
        this.SceneBoundingSphere = this.getBoundingSphere()
        this.pl3.constant = this.SceneBoundingSphere.center.z
      }
      else {
        let index = this.renderer.clippingPlanes.indexOf( this.pl3 )
        this.renderer.clippingPlanes.splice(index, 1)
      }
    },
    'Sections.pl3Flip'() {
      this.pl3.negate()
    },
    'Sections.pl3Value'() {
      if( !this.Sections.pl3 ) return
      this.pl3.constant = this.mapNumber( this.Sections.pl3Value, 0, 100, this.SceneBoundingSphere.center.z - this.SceneBoundingSphere.radius, this.SceneBoundingSphere.center.z + this.SceneBoundingSphere.radius )
    }
  },
  ready() {
    let self = this
    // hidden, non-reactive vars
    this.GeoStore = GeoStore
    
    // initialize stuff
    this.initialize()
    
    window.addEventListener( 'resize', this.resizeCanvas )

    // events
    
    Bus.$on('droplet-change', droplet => {
      let incoming = []
      for(let struct of droplet.structure)
        for(let hash of struct.objects) {
          incoming.push( { hash: hash, layerguid: struct.guid } )
        }
      self.diffScene( incoming )
    })

    Bus.$on('toggle-visibility', (opts) => { 
      this.toggleLayerVisibility(opts) 
    } )
    Bus.$on('hover-objects', (objs) => {
      for(let hash of objs) {
        let obj = _.findWhere(this.parsedObjects, {hash: hash})
        if( obj ) {
          obj.restColor = obj.material.color
          obj.material.color = new THREE.Color('#FF8000')
        }
      }
    })
    Bus.$on('nohover-objects', (objs) => {
      for(let hash of objs) {
        let obj = _.findWhere(this.parsedObjects, {hash: hash} )
        if( obj && obj.visible ) {
          obj.material.color = obj.restColor
        }
      }
    })
    Bus.$on('change-color', (opts) => {
      for(let obj of opts.objs ) {
        let jester = _.findWhere( this.parsedObjects, { hash: obj })
        if(jester) {
          jester.material.color = new THREE.Color(opts.color)
          jester.material.opacity = opts.alpha
          if(jester.children[0])
            jester.children[0].material.color = new THREE.Color(opts.color)
        }
      }
    })
    Bus.$on('zoom-objects', (data) => {
      self.zoomExtents( data )
    })

    Bus.$on('toggle-grid', () => { 
      self.gridHelper.visible = ! self.gridHelper.visible
    })

    Bus.$on('download-file', ( data ) => {
      this.downloadStl(data.name)
    })
  },
  beforeDestroy() {
    cancelAnimationFrame( this.animationid )
    // THIS IS IMPORTANT (below)
    // Problem was the bus events kept on piling. 
    // Took only half a sunday to solve.
    Bus.$off()
    // END OF THE SHIT
  }
}
</script>
<style scoped>
.made-with {
  position: fixed;
  bottom: 0;
  right: 10;
  font-size: 10px;
}
.made-with a {
  line-height: 35px;
  font-weight: 400;
  text-decoration: none;
}
.made-with a:hover {
  color: #0080FF;
}

.canvas {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 !important;
}
</style>