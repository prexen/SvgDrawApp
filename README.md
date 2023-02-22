# SvgDrawApp
A simple react svg drawing app to help creating svg´s in html and react forms. No external dependencies or npm packages.
You can try it on: https://prexen.github.io/SvgDrawApp/

TLDR: Choose your viewbox size on the top left of the interface, select one of the drawing tools and click on the canvas. The last point of the <b>line tool</b> you must press <i>"enter"</i>.

Diferent snap settings, control over viewbox size, stroke width, fill and more. You can layer diferent paths to create multi color svgs.
Below the drawing area you can preview your svg in diferent resolutions.

The svgs can be saved on localstorage and you can use an image as background to draw your svg over it. Theres some shortcuts and a undo system (ctrl-z) in place in case you missclicked some tool or deleted a node. While the move tool or no tool is selected you can press <i>"del"</i> while hovering over an element node to delete it.
When moving a node, if you use <i>"shift"</i> you move the entire object the node is part of.


<h3>Main interface of the app.</h3>

![svgDraw_geral](https://user-images.githubusercontent.com/12590962/212567965-1f059024-a882-4086-9ad7-fd3f4be8ab46.png)


<h3>Loading an icon from lib and editing.</h3>

![edits_svgDraw](https://user-images.githubusercontent.com/12590962/212568635-4ed3b9ee-638e-477b-93b2-e94591c89409.png)



<h3>You can snap to endpoints, midpoints, intersections, grid and angle for precise icon creation.</h3>

![snapShowSvgDraw](https://user-images.githubusercontent.com/12590962/212568224-f468e870-75c0-4af6-abca-c4107107e0d0.png)
