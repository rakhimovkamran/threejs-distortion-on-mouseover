import * as THREE from "three"
import Images from "./vendor/images"

import { vertex_shader, fragment_shader } from "../../shaders"
import { LERP } from "../../utils"

/*
Mouse Coords
*/
let targetX = 0,
    targetY = 0

/*
Load Image Textures for Mesh
*/

const Texture_1 = new THREE.TextureLoader().load(Images.image_1)
const Texture_2 = new THREE.TextureLoader().load(Images.image_2)
const Texture_3 = new THREE.TextureLoader().load(Images.image_3)
const Texture_4 = new THREE.TextureLoader().load(Images.image_4)

/*
Main WebGL Class
*/

class WebGL {
    constructor() {
        this.root = document.querySelector("#main")
        this.links = [...document.querySelectorAll("li")]

        this.scene = new THREE.Scene()
        this.perspective = 1000

        this.sizes = new THREE.Vector2(0, 0) // Mesh Size
        this.offset = new THREE.Vector2(0, 0) // Mesh Position

        this.uniforms = {
            uTexture: { value: Texture_1 },
            uAlpha: { value: 0.0 },
            uOffset: { value: new THREE.Vector2(0.0, 0.0) },
        }

        const changeTexture = (texture) =>
            (this.uniforms.uTexture.value = texture)

        this.links.forEach((link, idx) => {
            link.addEventListener("mouseenter", () => {
                changeTexture([Texture_1, Texture_2, Texture_3, Texture_4][idx])
            })

            link.addEventListener("mouseleave", () => {
                this.uniforms.uAlpha.value = LERP(
                    this.uniforms.uAlpha.value,
                    0.0,
                    0.1
                )
            })
        })

        this.addEventListeners(document.querySelector("ul"))

        this.setupCamera()

        this.onMouseMove()
        this.createMesh()

        this.render()
    }

    get viewport() {
        const { innerWidth: width, innerHeight: height } = window,
            aspectRatio = width / height

        return {
            aspectRatio,
            height,
            width,
        }
    }

    onMouseMove() {
        window.addEventListener("mousemove", (e) => {
            targetX = e.clientX
            targetY = e.clientY
        })
    }

    addEventListeners(element) {
        element.addEventListener("mouseenter", () => {
            this.linkHovered = true
        })

        element.addEventListener("mouseleave", () => {
            this.linkHovered = false
        })
    }

    setupCamera() {
        window.addEventListener("resize", this.onWindowResize.bind(this))

        const FOV =
            (180 *
                (2 * Math.atan(this.viewport.height / 2 / this.perspective))) /
            Math.PI

        this.camera = new THREE.PerspectiveCamera(
            FOV,
            this.viewport.aspectRatio,
            0.1,
            1000
        )

        this.camera.position.set(0, 0, this.perspective)

        this.renderer = new THREE.WebGL1Renderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.viewport.width, this.viewport.height)

        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.root.appendChild(this.renderer.domElement)
    }

    onWindowResize() {
        this.camera.aspect = this.viewport.aspectRatio
        this.camera.fov =
            (180 *
                (2 * Math.atan(this.viewport.height / 2 / this.perspective))) /
            Math.PI

        this.renderer.setSize(this.viewport.width, this.viewport.height)

        this.camera.updateProjectionMatrix()
    }

    createMesh() {
        this.geometry = new THREE.PlaneGeometry(1, 1, 20, 20)
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            transparent: true,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.sizes.set(250, 350)
        this.mesh.scale.set(this.sizes.x, this.sizes.y)
        this.mesh.position.set(this.offset.x, this.offset.y)

        this.scene.add(this.mesh)
    }

    render() {
        this.offset.x = LERP(this.offset.x, targetX, 0.1)
        this.offset.y = LERP(this.offset.y, targetY, 0.1)

        this.uniforms.uOffset.value.set(
            (targetX - this.offset.x) * 0.0005,
            -(targetY - this.offset.y) * 0.0005
        )

        this.mesh.position.set(
            this.offset.x - window.innerWidth / 2,
            -this.offset.y + window.innerHeight / 2
        )

        this.uniforms.uAlpha.value = this.linkHovered
            ? LERP(this.uniforms.uAlpha.value, 1.0, 0.1)
            : LERP(this.uniforms.uAlpha.value, 0.0, 0.1)

        for (let i = 0; i < this.links.length; i++) {
            this.links[i].style.opacity = this.linkHovered ? 0.3 : 1
        }

        this.renderer.render(this.scene, this.camera)

        window.requestAnimationFrame(this.render.bind(this))
    }
}

new WebGL()
