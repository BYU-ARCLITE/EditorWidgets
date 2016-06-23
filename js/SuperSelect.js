(function(){
	if(typeof window.EditorWidgets !== 'object'){
		window.EditorWidgets = {};
	}

	function SuperSelect(){
		var main = document.createElement('div'),
			select = document.createElement('select'),
			defOption = document.createElement('option'),
			defaultText = "",
			defaultDesc = "",
			
			showDefault = false,
			options = [],
			value = [],
			multiple = false,
			btnpos = "left";
		
		main.style.display = "inline-block";
		main.style.position = "relative";
		
		select.style.display = "none";
		select.multiple = true;
		select.appendChild(defOption);

		main.appendChild(select);
	
	<div style="display:inline-block;position:relative;">

		<div class="superselect">
		
			{{#(button === "left")}}<div>
				<button class="btn" on-tap="open"><i class="{{icon}}"></i> {{text}}</button>
			</div>{{/button}}
		
			<span>
				{{#options:i}}
					{{#checkSelected(.value,selection)}}
						<span class="badge badge-info pad-right-low">
							{{.text}} {{#multiple}}<span style="color: white; cursor: pointer;" on-tap="select:{{i}}">×</span>{{/multiple}}
						</span>
					{{/checkSelected}}
				{{/options}}
			
				{{#showDefault}}
					<span class="badge badge-info pad-right-low">
						{{defaultValue.text}}
					</span>
				{{/showDefault}}
			
				{{^selection.length}}<span>Nothing selected</span>{{/selection.length}}
			
			</span>\
			
			{{^(button === "left")}}<div>
				<button class="btn" on-tap="open"><i class="{{icon}}"></i> {{text}}</button>
			</div>{{/button}}

		</div>

		<div class="superselectPopup {{(button === "left"?"left":"right")}}" style="display:{{open?"block":"none"}};" on-tap="clickpopup">\
			<div class="point"></div>
			<div class="point"></div>

			<div>
				<input type="text" class="search-query" value="{{filterstr}}"/>
			</div>

			<div class="optionListing">

			</div>

		</div>

	</div>
	
		Object.defineProperties(this,{
			name: {
				get: function(){ return select.name; },
				set: function(n){ return select.name = n; }
			},
			id: {
				get: function(){ return select.id; },
				set: function(id){ return select.id = id; }
			},
			multiple: {
				get: function(){ return multiple; },
				set: function(b){
					var old = multiple;
					multiple = !!b;
					if(old && !multiple){
						value = value.slice(0,1);
						[].forEach.call(select.options,function(o){
							if(o.value !== value[0]){ o.selected = false; }
						});
					}
				}
			},
			defaultValue: {
				get: function(){ return defOption.value; },
				set: function(v){ return defOption.value = v; }
			},
			defaultText: {
				get: function(){ return defaultText; },
				set: function(v){ return defaultText = ""+v; }
			},
			defaultDesc: {
				get: function(){ return defaultDesc; },
				set: function(v){ return defaultDesc = ""+v; }
			},
			defaultOption: {
				get: function(){ return {text: defaultText, desc: defaultDesc, value: defOption.value}; },
				set: function(v){
					v = v||{};
					defaultText = ""+v.text;
					defaultDesc = ""+v.desc;
					defOption.value = v.value;
					return this.defaultOption;
				}
			},
			options: {
				get: function(){
					return options.map(function(o){
						return {
							text: o.text,
							desc: o.desc,
							value: o.value
						};
					});
				},
				set: function(newopts){
					options = [].map.call(newopts,function(o){
						var badge = constructBadge(o.text,function(){}),
							popup = constructPopup(o.text,o.desc,function(){}),
							opt = document.createElement('option');
						
						opt.value = o.value;
						
						if(value.indexOf(o.value) > -1){
							opt.selected = true;
							badge.display = "inline;";
							popup.className = "option selected";
						}else{
							opt.selected = false;
							badge.display = "none";
							popup.className = "option";
						}

						return {
							text: o.text,
							desc: o.desc,
							value: o.value,
							badge: badge,
							popup: popup,
							opt: opt
						};
					});

					value = value.filter(function(v){ return options.some(function(o){ return o.value == v; }); });

					select.innerHTML = "";
					badgeHolder.innerHTML = "";
					popupHolder.innerHTML = "";

					//TODO: Deal with default badge
					options.forEach(function(o){
						select.appendChild(o.opt);
						badgeHolder.appendChild(o.badge);
						popupHolder.appendChild(o.popup);
					});
				}
			}
			value: {
				get: function(){
					return value.length?value:[defOption.value];
				},
				set: function(val){
					if(!(val instanceof Array)){ val = [val]; }

					val = val.filter(function(v){ return options.some(function(o){ return o.value == v; }); });

					if(!multiple){ val = val.slice(0,1); }

					value = val;

					options.forEach(function(o){
						if(value.indexOf(o.opt.value) > -1){
							o.opt.selected = true;
							o.badge.style.display = "inline";
							o.popup.classList.add("selected");
						}else{
							o.opt.selected = false;
							o.badge.style.display = "none";
							o.popup.classList.remove("selected");
						}
					});

					if(value.length === 0){
						if(showDefault){
							defOption.selected = true;
							defaultBadge.style.display = "inline";
						}else{
							noSelection.style.display = "inline";
						}
					}else{
						noSelection.style.display = "none";
					}
				}
				
			}
		});
		
	}

	function constructBadge(text,cb){
		var badge = document.createElement('span'),
			x = document.createElement('span');
		
		badge.className = "badge badge-info pad-right-low";
	
		x.style.color = "white";
		x.style.cursor = "pointer";
	
		x.addEventListener("click",cb,false);
	
		badge.appendChild(document.createTextNode(text));
		badge.appendChild(x);
		return badge;
	}

	function constructPopup(text,desc,cb){
		var main = document.createElement('span'),
			tcon = document.createElement('span'),
			dcon = document.createElement('span'),
			check = document.createElement('div');

		main.style.clear = "both";
		tcon.style.textAlign = "left";
		dcon.style.float = "right";
		check.className = "check";
		
		tcon.appendChild(check);
		tcon.appendChild(document.createTextNode(text));
		
		dcon.appendChild(document.createTextNode(desc));

		main.appendChild(tcon);
		main.appendChild(dcon);

		main.addEventListener("click",cb,false);
		
		return main;
	}

	/*
		data: {
			filterstr: "",
			filter: function(str,text,desc){
				return	text.toLowerCase().indexOf(str.toLowerCase()) > -1 ||
						desc.toLowerCase().indexOf(str.toLowerCase()) > -1 ;
			},
			checkSelected: function(optval,selval){
				return ~selval.indexOf(optval);
			},
			showDefault: false
		},
		onrender: function(options){
			var r = this,
				popup = this.find('.superselectPopup'),
				superSel = this.find('.superselect .btn'),
				select = this.find('select'),
				defval = this.get("defaultValue"),
				defaultExists = !!defval,
				modalId = this.get("modalId"),
				resizeEvt;

			// Allow the popup to pop out of whatever element it is in to reduce cliping
			popup.parentNode.removeChild(popup);

			// Check to see if the modal exists
			// Do this because some ractive elements are created without being used,
			// so the modals don't actually exist. So its just safer to check if the
			// modal exists first.
			if (!document.querySelectorAll("#" + modalId).length) { modalId = false; }

			if (modalId){
				// Modals don't allow selection of input elements outside of modal
				document.getElementById(modalId).appendChild(popup);
				resizeEvt = function(){
					var bodyRect = document.getElementById(modalId).getBoundingClientRect(),
						elemRect = superSel.getBoundingClientRect(),
						offsetTop = (elemRect.top + 45) - bodyRect.top,
						offsetLeft = elemRect.left - bodyRect.left;
					popup.style.top = offsetTop + "px";
					popup.style.left = offsetLeft + "px";
				};
			} else {
				document.body.appendChild(popup);
				resizeEvt = function(){
					var bodyRect = document.body.getBoundingClientRect(),
						elemRect = superSel.getBoundingClientRect(),
						offsetTop = (elemRect.top + 45) - bodyRect.top,
						offsetLeft = elemRect.left - bodyRect.left;
					popup.style.top = offsetTop + "px";
					popup.style.left = offsetLeft + "px";
				};
			}
			this.set('showDefault', (defaultExists && !(this.get("selection").length)));
			if (this.get('showDefault')){
				this.set('selection',[defval.value]);
			} else if (defaultExists){
				if (~this.get("selection").indexOf(defval.value))
					this.set('showDefault', true);
			}

			this.set('open',false);
			this.on('clickpopup',function(e){ e.original.stopPropagation(); });
			this.on('open',function(e) {
				e.original.stopPropagation();
				e.original.preventDefault();
				if(this.get("open")){
					this.set('open', false);
				}else{
					this.set('open', true);
					resizeEvt();
					this.find('input.search-query').focus();
				}
				return false;
			});
			this.on('select',function(e,which){
				var sels = this.get("selection"),
					selopt = select.options[which],
					optval = this.get("options")[which].value;
				if(this.get("multiple")){
					if(selopt.selected){
						sels.splice(sels.indexOf(optval),1);
						if (defaultExists && sels.length === 0) {
							sels.push(defval.value);
							this.set('showDefault', true);
						}
					}else{
						sels.push(optval);
						if (defaultExists && sels[0] === defval.value) {
							sels.splice(0,1);
							this.set('showDefault', false);
						}
					}
				} else {
					select.value = optval;
					if(sels[0] === optval){
						if(!defaultExists){ return; }
						this.set('selection', [defval.value]);
						this.set('showDefault', true);
					} else {
						this.set('selection', [optval]);
						this.set('showDefault', false);
					}
					this.set('open', false);
				}
				resizeEvt();
			});
			window.addEventListener("resize", function(){ if (r.get("open")) resizeEvt(); }, false);
			window.addEventListener("click", function(){ r.set('open',false); }, false);
			document.addEventListener("keyup", function(e) {
				if (e.keyCode === 27) { r.set('open',false); }
			});
		}
	});
	*/

	if(window.Ractive){
		Ractive.components.SuperSelect = Ractive.extend({
			template: `
				<button on-click='@this.toggle("open")'>toggle open</button>
				<div class='{{open ? "open" : "closed"}}' on-click='@this.select(event.original)'>
					<!-- instead of using data binding, we'll render this manually -->
				</div>`,
			data: { open: true },
			onrender () {
				const div = this.find( 'div' );
				this.observe( 'items', items => {
					div.innerHTML = '<ul>' + items.map( (x,i) => `<li data-index='${i}'>${x.label}</li>` ).join( '\n' ) + '</ul>';
				});
			},
			select ( e ) {
				const index = e.target.getAttribute( 'data-index' );
				if ( index ) {
					this.fire( 'select', this.get( 'items' )[ index ] );
				}
			}
		});

		/*
		var ractive = new Ractive({
		  el: 'main',
		  template: `
			<button on-click='@this.changeItems()'>change items</button>
			<SuperSelect items='{{items}}' on-select='@this.set("selected",$1)'/>
			<p>selected: {{selected ? selected.label : 'nothing'}}</p>`,
		  oninit () {
			this.changeItems();
		  },
		  changeItems () {
			var i = ~~( 3 + Math.random() * 10 );
			var items = Array( i );
			while ( i-- ) {
			  items.push({ label: String.fromCharCode( ~~( 65 + Math.random() * 26 ) ) });
			}
			this.set( 'items', items );
		  },
		  components: { SuperSelect }
		});
		*/
	}
}());