import THREE from 'three'

export default class {
  constructor() {
    this.basicMaterial = new THREE.MeshPhongMaterial( { color: new THREE.Color('#FF66FF'), specular: new THREE.Color('#FFECB3'), shininess: 100, shading: THREE.FlatShading , side: THREE.DoubleSide } )
    this.basicMaterial.side = THREE.DoubleSide
  }

  static getThreeObject( obj, cb) {
    if( !obj ) return conosle.log( 'null argument' )    
    // console.log( obj.type )
    switch(obj.type) {
      case 'GH_Point':
        return cb( this.toPoint( obj ) )
      case 'GH_Rectangle': 
        return cb( this.toRect( obj ) )
      case 'GH_Circle':
        return cb( this.toCircle( obj ))
      case 'GH_Curve': 
        return cb( this.toPoly( obj, true ) )
      case 'GH_Polyline':
        return cb( this.toPoly( obj, false ) )
      case 'GH_Line':
        return cb( this.toLine( obj ) )
      case 'GH_Surface':
      case 'GH_Brep':
        return cb( this.toMesh( obj, true ) )
      case 'GH_Mesh':
        return cb( this.toMesh( obj, false) )
      case 'GH_Box':
        return cb( this.toBox( obj ))
        break
      case 'GH_Plane':
        return cb( this.toPlane( obj ) )
      default:
        // console.info('Can not convert ' + obj.type + ' to three object.')
    }
  }

  static toPoint( obj ) {
    let geometry = new THREE.Geometry()  
    geometry.vertices.push( new THREE.Vector3( obj.value.Y, obj.value.Z, obj.value.X ) )
    let retObj = new THREE.Points( geometry, new THREE.PointsMaterial( {color: new THREE.Color("#F649F4"), sizeAttenuation: false, size: 3} ) )
    retObj.spklayer = obj.groupName
    return retObj;
  }

  static toPoly( obj, fromCurve ) {
    let points = []
    let geometry = new THREE.Geometry()

    if( fromCurve ) points = obj.displayValue
    else points = obj.value
    for(let myVertex of points) 
      geometry.vertices.push( new THREE.Vector3( myVertex.Y, myVertex.Z, myVertex.X ) )

    let material = new THREE.LineBasicMaterial( { color : new THREE.Color("#0078FF"), linewidth: 2 } )
    material.transparent = true
    material.opacity = 0
    let myObj = new THREE.Line( geometry, material )
    myObj.spklayer = obj.groupName

    return myObj;
  }

  static toLine( obj ) {
    let geometry = new THREE.Geometry()
    geometry.vertices.push( new THREE.Vector3( obj.value.start.Y, obj.value.start.Z, obj.value.start.X) )
    geometry.vertices.push( new THREE.Vector3( obj.value.end.Y, obj.value.end.Z, obj.value.end.X) )

    let material = new THREE.LineBasicMaterial( { color : new THREE.Color("#0078FF"), linewidth: 2} )
    material.transparent = true
    material.opacity = 0
    let myObj = new THREE.Line( geometry, material )
    myObj.spklayer = obj.groupName
    return myObj;
    // return
  }

  static toMesh( obj , fromBrep ) {
    let geometry = new THREE.Geometry()
    let data = {}
    if( fromBrep )
      data = obj.displayValue
    else
      data = obj.value

    for( let myVertex of data.vertices)
    {
      geometry.vertices.push( new THREE.Vector3( myVertex.Y, myVertex.Z, myVertex.X ) )
    }
    
    for( let face of data.faces) 
      if(face.IsQuad) {
        geometry.faces.push( new THREE.Face3(face.A, face.B, face.C) )
        geometry.faces.push( new THREE.Face3(face.A, face.C, face.D) )
      } else {
        geometry.faces.push( new THREE.Face3(face.A, face.B, face.C) )
      }
    let material = new THREE.MeshPhongMaterial( { color: new THREE.Color('#C0C0C0'), specular: new THREE.Color('#FFECB3'), shininess: 10, shading: THREE.FlatShading } )
    // let material = new THREE.MeshLambertMaterial( {color: new THREE.Color('#F3F3F3')})
    material.side = THREE.DoubleSide
    material.shading = THREE.SmoothShading
    material.transparent = true
    material.opacity = 0
    material.alphatest = 0.5

    let myObj = new THREE.Mesh( geometry, material )
    myObj.spklayer = obj.groupName
    myObj.geometry.computeFaceNormals()
    myObj.geometry.computeVertexNormals()

    // let edgesHelper = new THREE.EdgesHelper( myObj, new THREE.Color('#ECECEC'), 60)
    // myObj.children.push(edgesHelper)
    return myObj;
  }

  static toPlane( obj ) {
    let data = obj.value
    
    let geometry = new THREE.PlaneGeometry( 5 , 5, 4)
    geometry.lookAt( new THREE.Vector3( data.zdir.Y, data.zdir.Z, data.zdir.X ) )
    geometry.translate( data.origin.Y, data.origin.Z, data.origin.X )
    
    let plane = new THREE.Mesh( geometry, this.basicMaterial )
    plane.material.side = THREE.DoubleSide
    plane.material.transparent = true

    let edgesHelper = new THREE.EdgesHelper( plane, new THREE.Color('#ECECEC'), 60)
    plane.children.push(edgesHelper)
    
    return plane
  }

  static toBox( obj ) {
    let data = obj.value
    let absx = data.X.max - data.X.min, absy = data.Y.max - data.Y.min, absz = data.Z.max - data.Z.min

    let geometry = new THREE.BoxGeometry( absy, absz, absx)
    geometry.lookAt( new THREE.Vector3( data.normal.Y, data.normal.Z, data.normal.X ) )
    geometry.translate( data.center.Y, data.center.Z, data.center.X )
    let material = new THREE.MeshPhongMaterial( { color: new THREE.Color('#C0C0C0'), specular: new THREE.Color('#FFECB3'), shininess: 10, shading: THREE.FlatShading } )
    let cube = new THREE.Mesh( geometry, material )

    cube.material.side = THREE.DoubleSide
    cube.material.transparent = true

    return cube
  }

  static toCircle( obj ) {
    let data = obj.value
    let geometry = new THREE.CircleGeometry( data.radius, 32)
    geometry.vertices.shift() // pop center vertex out

    geometry.lookAt( new THREE.Vector3( data.normal.Y, data.normal.Z, data.normal.X ) )
    geometry.translate( data.center.Y, data.center.Z, data.center.X )
    let material = new THREE.LineBasicMaterial( { color : new THREE.Color("#0078FF"), linewidth: 2} )
    material.transparent = true
    let line = new THREE.Line( geometry, material )

    return line
  }

  static toRect( obj ) {
    let data = obj.value
    let geometry = new THREE.Geometry()
    geometry.vertices.push( new THREE.Vector3( data.A.Y, data.A.Z, data.A.X ) )
    geometry.vertices.push( new THREE.Vector3( data.B.Y, data.B.Z, data.B.X ) )
    geometry.vertices.push( new THREE.Vector3( data.C.Y, data.C.Z, data.C.X ) )
    geometry.vertices.push( new THREE.Vector3( data.D.Y, data.D.Z, data.D.X ) )
    geometry.vertices.push( new THREE.Vector3( data.A.Y, data.A.Z, data.A.X ) )

    let material = new THREE.LineBasicMaterial( { color : new THREE.Color("#0078FF"), linewidth: 2} )
    material.transparent = true
    let line = new THREE.Line( geometry, material )

    return line
  }
}