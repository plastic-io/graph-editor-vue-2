export default {
    "openGraph": {
        "title": "Graph Manager",
        "html": `Opens the Graph Manager in another window.
Graph Manager allows you to create, open, delete and download graphs stored on your browser and on the internet.`
    },
    "deleteSelected": {
        "title": "Delete Selected",
        "html": "Deletes the currently selected vectors and connectors.<br>Keyboard Shortcut DELETE",
    },
    "documentName": {
        "title": "Document Name",
        "html": "Name of the document.  This is the name that appears in the graph manager.  This name will also be used if this graph is published."
    },
    "plastic": {
        "title": "   ",
        "html": `
        <v-card>
            <div style="text-align: center;">
                <img style="width: 75px;" src="https://avatars1.githubusercontent.com/u/60668496?s=200&v=4"/>
                <br>
                <a href="https://github.com/plastic-io">Plastic-io</a>
                <br>
                Visual Programming Language
            </div>
            <div style="text-align: center;">
                Written by Tony Germaneri<br>
                Copyright &copy; 2020, plastic-io<br>
                All rights reserved<br>
            </div>
        </v-card>`
    },
    "undo": {
        "title": "Undo",
        "html": "Undoes the last action.<br>Keyboard Shortcut CTRL/CMD + Z"
    },
    "redo": {
        "title": "redo",
        "html": "Redoes the last action.<br>Keyboard Shortcut CTRL/CMD + SHIFT + Z"
    },
    "duplicate": {
        "title": "Duplicate",
        "html": "Duplicates the selected vectors and connectors<br>Keyboard Shortcut CTRL/CMD + SHIFT + D"
    },
    "group": {
        "title": "Group",
        "html": "Groups the selected vectors<br>Keyboard Shortcut CTRL/CMD + G"
    },
    "ungroup": {
        "title": "Ungroup",
        "html": "Ungroups the selected vectors<br>Keyboard Shortcut CTRL/CMD + SHIFT + G"
    },
    "bringForward": {
        "title": "Bring Forward",
        "html": "Brings the selected vectors forward one layer<br>Keyboard Shortcut CTRL/CMD + ]"
    },
    "bringToFront": {
        "title": "Bring To Front",
        "html": "Brings the selected vectors to the front of the stack<br>Keyboard Shortcut CTRL/CMD + SHIFT + ]"
    },
    "sendBackward": {
        "title": "Send Backward",
        "html": "Sends the selected vectors back one layer<br>Keyboard Shortcut CTRL/CMD + ["
    },
    "sendToBack": {
        "title": "Send To Back",
        "html": "Sends the selected vectors to the back of the stack<br>Keyboard Shortcut CTRL/CMD + SHIFT + ["
    },
    "toggleHelp": {
        "title": "Toggle Help",
        "html": "Toggles this help overlay"
    },
    "vectorProperties": {
        "title": "Vector Properties",
        "html": "Properties for the primary selected vector.  Only one vector can be altered at a time.  The first vector you click on, even when in a group, is the primary selected vector."
    },
    "set": {
        "title": "Vector Set Function",
        "html": `
<div style="height: 70vh; overflow: auto;padding: 7px;border: solid 1px rgba(0, 0, 0, 0.3);background: rgba(0, 0, 0, 0.1);border-radius: 5px;">
    <p>Set functions are the core of plastic-io.  Set functions are invoked when vectors pass data from one to another.  Your function can be vector can be invoked directly via the <i>scheudler.url(vectorUrl)</i> function, or from within the another vector using <i>edge[outputName] = val</i>.</p>
    <p>Unless your vector is expected to be the last one invoked, you'll likely invoke another vector using <i>edge[outputName] = val</i>.</p>
    <p>There is no time limit to when you invoke your vectors edges.  You can use this to control the asyncronous flow of your program.</p>
    <h4>Interface</h4>
    <p>
        <table>
            <tr>
                <th>Name</th>
                <th>Description</th>
            </tr>
            <tr>
                <td>
                    edges
                </td>
                <td>These edge outputs are defined in the designer.  E.x.: edges.x = "foo" sends "foo" out of the x edge.
            </tr>
            <tr>
                <td>state</td>
                <td>Scheduler state.  Use this shared object to track your application state.</td>
            </tr>
            <tr>
                <td>field</td>
                <td>The name of the input field trigged by the remote vector edge.</td>
            </tr>
            <tr>
                <td>value</td>
                <td>The value passed to the field.</td>
            </tr>
            <tr>
                <td>vector</td>
                <td>The vector schema, contains many of the other fields.</td>
            </tr>
            <tr>
                <td>cache</td>
                <td>Vector specific runtime cache object.  Stick what you want here, it's yours, but it goes away.</td>
            </tr>
            <tr>
                <td>graph</td>
                <td>The entire graph.</td>
            </tr>
            <tr>
                <td>data</td>
                <td>Vector specific data.  This data persists between runs.  Requires graph modification to change.</td>
            </tr>
            <tr>
                <td>properties</td>
                <td>Graph editor properties and input/output field list.</td>
            </tr>
        </table>
    </p>
    <h4>When Does this run?</h4>
    <p>The vector set function is what runs when another vector's edge connector outputs to this vector.</p>
    <p>The set function also gets invoked when this vector is executed via <i>scheduler.url(vectorUrl)</i>.</p>
    <h4>What can it do?</h4>
    <p>The set function runs in the context that the graph was instantiated in.  This means if the graph was instantiated on the browser, the context of the graph will be the browser.  You only have access to the functionality in the context the graph was instantiated in.  This means if your graph was instantiated on the server, you cannot do things on the browser, and vice versa.</p>
</div>
        `
    },
    "template": {
        "title": "Vue Single File Component",
        "html": `
<div style="height: 70vh; overflow: auto;padding: 7px;border: solid 1px rgba(0, 0, 0, 0.3);background: rgba(0, 0, 0, 0.1);border-radius: 5px;">
    <p>
        When in the Graph IDE, each vector is represented by a Vue Single File Component.  This component can observe and manipulate the <i>vector</i>, <i>state</i>, and <i>scheduler</i>.
    </p>
    <h4>Props</h4>
    Attach to these events using <i>scheduler.addEventListener(event, proc)</i>
    <table>
        <tr>
            <td>vector</td>
            <td>The current vector.  You can alter the <i>data</i> property of the vector.  If your vector is in a writeable environment, changes will be persisted onto the graph. See <a href="https://plastic-io.github.io/plastic-io/modules/_vector_.html">Vector</a></td>
        </tr>
        <tr>
            <td>state</td>
            <td>Runtime state.  This is an empty object until it is manipulated by a vector.  Initial state can also be manipulated externally (off graph) by the scheduler.</td>
        </tr>
        <tr>
            <td>scheduler</td>
            <td>Graph execution scheduler.  You can observe events, manipulate state, or invoke vectors via URL. E.g.: Invoke the current vector: <i>scheduler.url(vector.url)</i>.  See <a href="https://plastic-io.github.io/plastic-io/classes/_scheduler_.scheduler.html">Scheduler</a></td>
        </tr>
    </table>
    <h4>Scheduler Events</h4>
    <p>Attach to these events using <i>scheduler.addEventListener(event, proc)</i></p>
    <table>
        <tr>
            <td>beginedge</td>
            <td>When an edge is about to be invoked</td>
        </tr>

        <tr>
            <td>endedge</td>
            <td>When an edge is finished invoking</td>
        </tr>

        <tr>
            <td>error</td>
            <td>When an error occurs</td>
        </tr>

        <tr>
            <td>set</td>
            <td>When a set function is run</td>
        </tr>

        <tr>
            <td>begin</td>
            <td>When the scheduler starts to run</td>
        </tr>

        <tr>
            <td>end</td>
            <td>When the scheduler is done running</td>
        </tr>

        <tr>
            <td>warning</td>
            <td>When a warning occurs</td>
        </tr>

        <tr>
            <td>load</td>
            <td>When a remote resourse is loaded</td>
        </tr>
    </table>
</div>
        `
    },
    "edge": {
        "title": "Vector Edges",
        "html": `
<p>Each vector can can zero or more inputs and/or outptus.  Values always flow from left to right.</p>
<h4>Names</h4>
<p>Inputs and outputs are named.  Within your <i>set</i> function at runtime, you can send data to outputs using <i>edge[outputName]</i>.</p>
<h4>Types</h4>
<p>Connectors are typed by matching string names to other string names in the "type" field.  The Object type can connect to any other type.  All other types strictly connect to matching types.
<h4>External</h4>
<p>When an input or output is marked "external" that means it will appears as an input or output in the graph when it is published.
<h4>Tests</h4>
<p>Each input can have a number of tests to exercise the code to ensure it works correctly.  You can create and run the tests here.  You can also run all tests from the vector properties panel.
`
    },
    "executeSelectedVector": {
        "title": "Execute Selected Vector",
        "html": "This will invoke <i>Scheduler.url(selectedVector.url)</i> with the value set in <i>preferences > test</i> value as if the vector was a graph entry point."
    },
    "graphProperties": {
        "title": "Graph Properties",
        "html": "Properties of current graph.  From here you can see all the graph properties, vectors, publishing and more."
    },
    "log": {
        "title": "Log and State",
        "html": "Here you can see information gathered at runtime as well as see the state of your application."
    },
    "history": {
        "title": "history",
        "html": "Undo/Redo history"
    },
    "import": {
        "title": "Library",
        "html": "Browse local and public vector libraries."
    },
    "settings": {
        "title": "Graph IDE Settings",
        "html": "Change the settings of the IDE"
    },
    "dragResizePanel": {
        "title": "Panel Resizer",
        "html": "Change the size of the control panel with this grabber."
    },
    "vector-edge": {
        "title": "Vector Edge",
        "html": "The connection sockets between vectors"
    },
    "vectorInstance": {
        "title": "Vector Instance",
        "html": "An instance of a vector"
    },
    "mouseCoordinates": {
        "title": "Mouse Coordinates",
        "html": "The current location of the mouse on the graph"
    },
    "SelectionCoordinates": {
        "title": "Selection Coordinates",
        "html": "The location and size of the selection box."
    },
    "selectedVectors": {
        "title": "Selected/Total Vectors",
        "html": "Count of selected/total vectors on the graph."
    },
    "viewportLocation": {
        "title": "Viewport Location",
        "html": "Where on the graph you're at.  You can move the viewpoint around with the middle mouse button, or by holding down the space bar and clicking and dragging the mouse.  Click the numbers to reset to x: 0, y: 0."
    },
    "viewportZoom": {
        "title": "Viewport Zoom Level",
        "html": "The current zoom level.  Click + to zoom in - to zoom out.  Click the number to reset to x: 100%.<br>Keyboard Shortcut CTRL/CMD + + and CTRL/CMD +"
    },
    "toggleLabels": {
        "title": "Toggle Labels",
        "html": "Toggle input/ouput labels on and off"
    },
    "toggleGrid": {
        "title": "Toggle Grid",
        "html": "Toggle the grid background on and off"
    },
    "toggleLock": {
        "title": "Toggle Lock",
        "html": "Lock vector movement.  This allows you to manipulate controls on the vector without inadvertently moving it."
    },
    "togglePresentation": {
        "title": "Toggle Presentation",
        "html": "Toggles presentation mode on and off.<br>  Keyboard Shortcut ALT + ` (the key above tab)",
    },
    "vector": {
        "title": "vector",
        "html": `Vectors are the building blocks of the graph.  Vectors are built in the graph designer.  Vectors can also be published and used in other graphs.  When you publish a graph you can import it into another graph as a encapsulated vector.
        <a href="https://plastic-io.github.io/plastic-io/modules/_vector_.html">Vector</a>`
    },
    "vectorName": {
        "title": "Vector Name",
        "html": "Name of the vector.  When published, this will show up in the list of published vectors."
    },
    "vectorDescription": {
        "title": "Vector Description",
        "html": "Description of the vector.  When published, this will show up in the list of published vectors."
    },
    "vectorUrl": {
        "title": "Vector URL",
        "html": "The URL of the vector.  Running a graph happens when a vector's URL is specified in the <i>Scheduler.url(vectorUrl)</i> function."
    },
    "vectorIcon": {
        "title": "Vector Icon",
        "html": "The icon that shows up next to the vector when it is published."
    },
    "vectorAppearsInExportedGraph": {
        "title": "Vector Appears In Published Graph",
        "html": "When checked, the vector's Vue component will appear in the published graph.  Even when not checked, the vector's set function will still be available."
    },
    "vectorLocation": {
        "title": "Vector Location",
        "html": "The location of the vector on the graph."
    },
    "vectorPresentationLocation": {
        "title": "Vector Presentation",
        "html": "The location of the vector when in presentation mode."
    },
    "vectorData": {
        "title": "Vector Data",
        "html": "Data saved on the vector by the Vue Template, Set function, or Vector designer."
    },
    "vectorPublish": {
        "title": "Publish",
        "html": "Clicking publish will publish your vector locally.  Once published locally you can reuse your vector on other graphs, and/or upload it to a public registry."
    },
    "vectorTags": {
        "title": "Tags",
        "html": "Help categorize and filter your vectors.  It can help to add the domain your vector executes in.  Add your own tags or use tags, or reuse popular ones."
    },
    "vectorTests": {
        "title": "Vector Tests",
        "html": "Create tests to exercise your code and ensure your vector works."
    },
    "setTemplate": {
        "title": "setTemplate",
        "html": "$set"
    },
    "vueTemplate": {
        "title": "vueTemplate",
        "html": "$template"
    },
    "outputs": {
        "title": "Outputs",
        "html": "Output ports."
    },
    "inputs": {
        "title": "Inputs",
        "html": "Input ports."
    },
    "ioOrder": {
        "title": "Port Order",
        "html": "The order in which the ports appear on the vector."
    },
    "ioIdentity": {
        "title": "Identity",
        "html": "The name and type of the port, as well as export flag."
    },
    "ioConnections": {
        "title": "Connections",
        "html": "List of connections made to this port."
    },
    "ioTests": {
        "title": "Tests",
        "html": "Tests associated with this input."
    },
    "inputs-name": {
        "title": "Name",
        "html": "Name of this input."
    },
    "inputs-type": {
        "title": "Type",
        "html": "Type of this input."
    },
    "inputs-external": {
        "title": "External",
        "html": "When true, this input will appear on the published graph."
    },
    "outputs-name": {
        "title": "Name",
        "html": "Name of this output"
    },
    "outputs-type": {
        "title": "Type",
        "html": "Type of this output."
    },
    "outputs-external": {
        "title": "External",
        "html": "When true, this output will appear on the published graph."
    },
    "connectorOrder": {
        "title": "Connector Order",
        "html": "The order in which the connectors are invoked on the vector output."
    },
    "graph": {
        "title": "Graph Properties",
        "html": "Properties of the graph."
    },
    "graphName": {
        "title": "Graph Name",
        "html": "Name of the graph.  This name will appear in the Graph Manager and published lists."
    },
    "graphDescription": {
        "title": "Graph Description",
        "html": "Description of the graph.  This description will appear in the Graph Manager and published lists."
    },
    "graphId": {
        "title": "Graph ID",
        "html": "The unique UUIDv4 of the graph generated when the graph was created."
    },
    "graphIcon": {
        "title": "Graph icon.  This icon will appear in the Graph Manager and published lists.",
        "html": "graphIcon"
    },
    "graphVersion": {
        "title": "Graph event source Version",
        "html": `<p>Each time a change is made to the graph, the version is increases by 1.</p>
        <p>Graph data is event sourced.  This means the graph data is not stored as state but rather a list of events.  Event sourcing provides a number of features.r</p>
        <ul>
            <li>Versioning</li>
            <li>State time travel</li>
            <li>Event idempotency</li>
            <li>Small, asyncronous updates</li>
            <li>Multi user</li>
            <li>Eventual consistency</li>
        </ul>
        `
    },
    "graphPresentation": {
        "title": "Presentation",
        "html": "Here, you can toggle having presentation mode turn on automatically when the graph loads.  You can set the height and width of the graph during presentation.  This data can be passed to internal vectors."
    },
    "graphMeta": {
        "title": "Graph meta data",
        "html": "Meta data about the graph you can set."
    },
    "graphVectorList": {
        "title": "Graph Vector List",
        "html": "List of vectors on the graph.  You can select vectors from here."
    },
    "graphPublishButton": {
        "title": "Graph Publish Button",
        "html": "Clicking here will publish the graph"
    },
    "graphTags": {
        "title": "Graph Tags",
        "html": "Help categorize and filter your graphs.  It can help to add the domain your graph executes in.  Add your own tags or use tags, or reuse popular ones."
    },
    "graphIOList": {
        "title": "External Input Output List",
        "html": "This is a list of inputs and outputs that are flagged exportable."
    },
    "logs": {
        "title": "Logs and State",
        "html": "Here you can find execution logs and scheduler state."
    },
    "logState": {
        "title": "State",
        "html": "The scheduler state."
    },
    "logErrors": {
        "title": "Errors",
        "html": "Errors logged during scheduler execution."
    },
    "logWarnings": {
        "title": "Warnings",
        "html": "Warnings logged during scheduler execution."
    },
    "logInfo": {
        "title": "Info",
        "html": "Info messages logged during scheduler execution."
    },
    "logStateRefresh": {
        "title": "State Refresh",
        "html": "Click here to force a refresh of the state view."
    },
    "logClear": {
        "title": "Clear Log",
        "html": "Clear the log"
    },
    "historyPanel": {
        "title": "History Panel",
        "html": "Session history"
    },
    "importPanel": {
        "title": "Vector Library",
        "html": "Collection of local and public vectors"
    },
    "importLocal": {
        "title": "Local Vectors",
        "html": "Vectors you've created and imported."
    },
    "importPublic": {
        "title": "Public Vectors",
        "html": "Vectors in public registries"
    },
    "importLocalSearch": {
        "title": "Local Search",
        "html": "Search your local collection of published vectors and graphs."
    },
    "importLocalList": {
        "title": "Local list",
        "html": "List of your published vectors and graphs."
    },
    "importPublicRegistryList": {
        "title": "Registry List",
        "html": "List of public registries."
    },
    "importPublicTopLevel": {
        "title": "Vector categories",
        "html": "This is the top level of vector categories of the repository."
    },
    "importPublicSecondLevel": {
        "title": "Vector subcategories",
        "html": "Public Vectors."
    },
    "importPublicList": {
        "title": "Public Vectors",
        "html": "List of public vectors."
    },
    "settingsGridSize": {
        "title": "Grid size",
        "html": "The size of the grid."
    },
    "settingsSnapToGrid": {
        "title": "Snap to grid",
        "html": "When on, vectors will snap to the grid when moved."
    },
    "settingsShowGrid": {
        "title": "Show grid",
        "html": "When on, the grid is visible."
    },
    "settingsShowLabels": {
        "title": "Show labels",
        "html": "When on, vector input and output labels are always visible."
    },
    "settingsDebug": {
        "title": "Debug",
        "html": "When on, additional detailed information in collected at runtime.  This will incur a performance penalty when turned on because a large amount of data is collected and stored in memory."
    },
    "vectorId": {
        "title": "Vector ID",
        "html": "The UUIDv4 of the vector.  This uniquely identifies the vector."
    },
};
