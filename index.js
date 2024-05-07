import initTimeComponent from 'lucos_time_component';
import Logo from './assets/lucos-logo.png';

class Navbar extends HTMLElement {
	static get observedAttributes() {
		return ['device','font','text-colour','bg-colour','streaming'];
	}
	constructor() {
		// Always call super first in constructor
		super();
		const component = this;

		const shadow = this.attachShadow({mode: 'closed'});
	
		const navbar = document.createElement('div');
		navbar.id="lucos_navbar";
		const homeimg = document.createElement('img');
		homeimg.src = Logo;
		homeimg.setAttribute("alt", "lucOS");
		homeimg.id = 'lucos_navbar_logo';
		const homeimglnk = document.createElement("a");
		homeimglnk.setAttribute("href", "https://l42.eu/");
		homeimglnk.appendChild(homeimg);
		navbar.appendChild(homeimglnk);
		
		const titleNode = document.createElement('span');
		while (this.firstChild) titleNode.appendChild(this.firstChild);
		titleNode.id='lucos_navbar_title';
		navbar.appendChild(titleNode);
		
		titleNode.appendChild(document.createElement('lucos-time'));

		const spacerNode = document.createElement('span');
		spacerNode.id='lucos_navbar_spacer';
		navbar.appendChild(spacerNode);

		const statusIndicatorNode = document.createElement('span');
		statusIndicatorNode.id='lucos_navbar_statusindicator';
		navbar.appendChild(statusIndicatorNode);
		
		// Swallow any clicks on the navbar to stop pages handling them
		navbar.addEventListener("click", function _stopnavbarpropagation(event) { event.stopPropagation(); }, false);

		// Primary stylesheet for the navbar
		const mainStyle = document.createElement('style');

		// Device-specific overrides
		const deviceStyle = document.createElement('style');

		// Title-specific overrides
		const titleStyle = document.createElement('style');

		// Colour-specific overrides
		const colourStyle = document.createElement('style');

		// Status Indicator overrides
		const statusIndicatorStyle = document.createElement('style');

		mainStyle.textContent = `

		:host {
			z-index:1000;
			height: 100%;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			height: 30px;
		}
		#lucos_navbar {
			font-size: 18px;
			font-family: Georgia, serif;
			height: 100%;
			display: flex;
		}
		#lucos_navbar_logo {
			height: 25px;
			padding: 2.5px 15px;
			width: 70px;
			cursor: pointer;
			border: none;
		}
		#lucos_navbar_title {
			text-align: center;
			line-height: 30px;
			font-weight: bold;
			height: 30px;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex-grow: 1;
		}
		lucos-time {
			font-size: 18px;
			font-family: "Courier New", Courier, monospace;
			margin: 0 1em;
			vertical-align: middle;
		}

		/**
		 * Used so title is centred (100px logo width minus 30px status indicator width leaves 70px spacer)
		 * Using a large flex shrink, so if there's not enough space, this is the first element to get squeezed
		 */
		#lucos_navbar_spacer {
			width: 70px;
			flex-shrink: 9999;
		}
		a {
			color: inherit;
			text-decoration-line: none;
			text-decoration-style: dashed;
			text-decoration-thickness: 1px;
		}
		a:hover {
			text-decoration-line: underline overline;
		}

		`;


		/**
		 * Some devices are tricksy (eg chromecasts), so need additional styling
		 */
		component.updateDeviceStyle = () => {
			switch(component.getAttribute("device")) {
				case "cast-receiver":

					deviceStyle.textContent = `
					#lucos_navbar {
						font-size: 4vh;
					}
					#lucos_navbar_logo {
						height: 5vh;
					}
					`;
					component.style.padding = "3vh";
					break;
				default:
					deviceStyle.textContent = '';
					component.style.padding = '';
			}
		};

		/**
		 * Allow specific sites to use a custom font for the title
		 */
		component.updateTitleFont = () => {
			if(!component.getAttribute("font")) {
				titleStyle.textContent = '';
			} else {
				titleStyle.textContent = `
				#lucos_navbar_title {
					font-size: 40px;
					font-family: ${component.getAttribute("font")};
				}
				`;
			}
		};

		/**
		 * Allow specific sites to use a custom colour for the navbar
		 */
		component.updateColour = () => {
			const textColour = component.getAttribute("text-colour") || 'white';
			const bgColour = component.getAttribute("bg-colour") || 'black';
			colourStyle.textContent = `
			:host {
				color: ${textColour};
				background-color: ${bgColour};
				background-image: linear-gradient(rgba(255, 255, 255, 0.4) 10%, transparent 85%, transparent 100%)
			}
			`;
		};

		/**
		 * Enable an indicator icon, which can change to show the current state of eg web socket connection
		 */
		component.updateStatusIndicator = () => {
			let iconColour;
			if (!component.getAttribute("streaming")) {
				// If not showing an indicator, keep the width of the element as if one were there for consistency
				statusIndicatorStyle.textContent = `
				#lucos_navbar_statusIndicator {
					display: block;
					width: 30px;
				}
				`;
				return;
			}
			if (component.getAttribute("streaming") === "active") iconColour = "green";
			else if (component.getAttribute("streaming") === "stopped") iconColour = "red";
			else iconColour = "white";
			statusIndicatorStyle.textContent = `
			#lucos_navbar_statusIndicator {
				background-color: ${iconColour};
				background-image: linear-gradient(rgba(255, 255, 255, 0.7) 15%, transparent 80%, transparent 85%, rgba(0, 0, 0, 0.2) 95%, transparent 100%);
				border: inset 1px ${iconColour};
				border-radius: 25px;
				display: block;
				padding: 11px;
				margin: 3px;
			}
			`;
		};
		shadow.appendChild(mainStyle);
		shadow.appendChild(deviceStyle);
		shadow.appendChild(titleStyle);
		shadow.appendChild(colourStyle);
		shadow.appendChild(statusIndicatorStyle);
		addGlobalStyle();
		component.updateDeviceStyle();
		component.updateTitleFont();
		component.updateColour();
		component.updateStatusIndicator();

		shadow.appendChild(navbar);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "device":
				this.updateDeviceStyle();
				break;
			case "font":
				this.updateTitleFont();
				break;
			case "text-colour":
			case "bg-colour":
				this.updateColour();
				break;
			case "streaming":
				this.updateStatusIndicator();
				break;
		}
	}
}

let globalStyleAdded = false;
function addGlobalStyle() {

	//Only ever load global style once
	if (globalStyleAdded) return;

	// Device-specific overrides
	const globalStyle = document.createElement('style');

	globalStyle.textContent = `
		body {
			padding-top: 30px;
		}
	`;

	// Prepend the global style, so individual pages can easily override (eg to set their own background-color)
	document.head.prepend(globalStyle);
	globalStyleAdded = true;
}

initTimeComponent();
customElements.define('lucos-navbar', Navbar);
