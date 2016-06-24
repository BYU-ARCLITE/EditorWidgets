(function(){
	if(typeof window.EditorWidgets !== 'object'){
		window.EditorWidgets = {};
	}
	/* text, btnpos, icon, multiple, target, options, value, name, id */
	function SuperSelect(args){
		var that = this, open = false,
			leftbtn, rightbtn, btnpos,
			parent, refnode, select, multiple,
			options, tmpopts, value,
			main = document.createElement('div'),
			rightbtn = document.createElement('button'),
			controls = document.createElement('div'),
			badgeHolder = document.createElement('span'),
			noSelection = document.createElement('span'),
			popup = document.createElement('div'),
			point = document.createElement('div'),
			filterbox = document.createElement('input'),
			filterdiv = document.createElement('div'),
			optionList = document.createElement('div');
		
		main.style.display = "inline-block";
		main.style.position = "relative";

		if(args.target.nodeName === "SELECT"){
			select = args.target;
			parent = select.parentNode;
			refnode = select.nextSibling;
			multiple = select.multiple;
		}else{
			parent = args.target;
			refnode = null;
			multiple = !!args.multiple;
		}

		main.appendChild(select);

		select.style.display = "none";
		select.multiple = true;

		controls.className = "superselect";
		
		leftbtn = constructButton(args.text, args.icon, this);
		rightbtn = constructButton(args.text, args.icon, this);
		
		controls.appendChild(leftbtn);

		noSelection.textContent = "Nothing selected";
		badgeHolder.appendChild(noSelection);
		controls.appendChild(badgeHolder);
	
		controls.appendChild(rightbtn);

		main.appendChild(controls)

		popup.className = "superselectPopup";
		popup.classList.add(btnpos);
		popup.style.display = "none";

		point.className = "point";
		popup.appendChild(point);
		popup.appendChild(point.cloneNode());

		filterbox.className = "search-query";
		filterbox.type = "text";

		filterbox.addEventListener('change',filterOptions,false);

		filterdiv.appendChild(filterbox);
		popup.appendChild(filterdiv);
		
		optionList.className = "optionListing";
		popup.appendChild(optionList);

		main.appendChild(popup);

		main.addEventListener('click',function(e){
			e.stopPropagation();
			if(!e.target.dataset.hasOwnProperty('index')){ return; }
			var i = +e.target.dataset.index;
			
		},false);

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
					var that = this, old = multiple;
					multiple = !!b;
					if(old && !multiple && value.length > 1){
						value = [value[0]];
						[].forEach.call(select.options,function(o, i){
							if(o.value !== value[0]){ that.deselect(i); }
						});
					}
				}
			},
			open: {
				get: function(){ return open; },
				set: function(b){
					open = !!b;
					popup.style.display = open?"block":"none";
					return open;
				}
			},
			btnpos: {
				get: function(){ return btnpos; },
				set: function(pos){
					popup.classList.remove(btnpos);
					if(pos === "right"){
						btnpos = "right";
						leftbtn.style.display = "none";
						rightbtn.style.display = "block";
					}else{
						btnpos = "left";
						leftbtn.style.display = "block";
						rightbtn.style.display = "none";
					}
					popup.classList.add(btnpos);
					return btnpos;
				}
			},
			select: {
				value: function(i){
					var o = options[i];
					if(!o || o.selected){ return; }
					o.selected = true;
					o.opt.selected = true;
					o.badge.display = "inline";
					o.listing.classList.add("selected");
					if(!multiple){
						options.forEach(function(opt){
							if(opt !== o && opt.selected){
								opt.selected = false;
								opt.opt.selected = false;
								opt.badge.display = "none";
								opt.listing.classList.remove("selected");
							}
						});
					}
					updateValue();
				}
			},
			deselect: {
				value: function(i){
					var o = options[i];
					if(!o || !o.selected){ return; }
					o.selected = false;
					o.opt.selected = false;
					o.badge.display = "none";
					o.listing.classList.remove("selected");
					updateValue();
				}
			},
			toggle: {
				value: function(i){
					var o = options[i];
					if(!o){ return; }
					if(o.selected){ this.deselect(i); }
					else{ this.select(i); }
				}
			},
			options: {
				get: function(){
					return options.map(function(o){
						return {
							text: o.text,
							desc: o.desc,
							value: o.value,
							selected: o.selected
						};
					});
				},
				set: function(newopts){
					var max = multiple?1/0:1;
					options = newopts.map(function(o,i){
						var badge = constructBadge(o.text,i),
							listing = constructlisting(o.text,o.desc,i),
							opt = document.createElement('option'),
							selected = max > 1 && o.selected !== false && (o.selected || value.indexOf(o.value) > -1);
						
						opt.value = o.value;
						
						if(selected){
							opt.selected = true;
							badge.display = "inline;";
							listing.className = "option selected";
							max--;
						}else{
							opt.selected = false;
							badge.display = "none";
							listing.className = "option";
						}

						return {
							text: o.text||"",
							desc: o.desc||"",
							value: o.value,
							selected: selected,
							badge: badge,
							listing: listing,
							opt: opt
						};
					});

					updateValue();

					select.innerHTML = "";
					badgeHolder.innerHTML = "";
					optionList.innerHTML = "";

					options.forEach(function(o){
						select.appendChild(o.opt);
						badgeHolder.appendChild(o.badge);
						optionList.appendChild(o.listing);
					});
				}
			}
			value: {
				get: function(){
					return value.slice();
				},
				set: function(val){
					if(!(val instanceof Array)){ val = [val]; }

					val = val.filter(function(v){ return options.some(function(o){ return o.value == v; }); });

					if(!multiple){ val = val.slice(0,1); }

					options.forEach(function(o){
						if(value.indexOf(o.opt.value) > -1){
							o.opt.selected = true;
							o.badge.style.display = "inline";
							o.listing.classList.add("selected");
						}else{
							o.opt.selected = false;
							o.badge.style.display = "none";
							o.listing.classList.remove("selected");
						}
					});

					updateValue();

				}
				
			}
		});

		this.btnpos = args.btnpos;

		tmpopts = (args.options instanceof Array)?
			args.options:
			[].map.call(select.options,function(opt){
				return {
					text: opt.textContent,
					desc: "",
					value: opt.value,
					selected: opt.selected
				};
			});

		this.options = tmpopts;
		this.value = args.value;

		if(typeof args.id === "string"){ this.id = args.id; }
		if(typeof args.name === "string"){ this.name = args.name; }

		parent.insertBefore(main, refnode);

		function updateValue(){
			value = options
						.filter(function(o){ return o.selected; })
						.map(function(o){ return o.value; });

			if(value.length === 0){
				noSelection.style.display = "inline";
			}else{
				noSelection.style.display = "none";
			}
		}

		function filterOptions(){
			var filterstr = this.value.toLowerCase();
			options.forEach(function(o){
				o.listing.style.display = (
					(o.text.toLowerCase().indexOf(filterstr) > -1) ||
					(o.desc.toLowerCase().indexOf(filterstr) > -1)
				)?"":"none";
			});
		}
	}

	function constructButton(text, iconclass, ss){
		var main = document.createElement('div'),
			btn = document.createElement('button'),
			icon = document.createElement('div');

		icon.className = iconclass;
		btn.appendChild(icon);
		btn.appendChild(document.createTextNode(text));
		main.appendChild(btn);

		btn.addEventListener('click',function(e){
			e.stopPropagation();
			ss.open = !ss.open;
		},false);

		return main;
	}

	function constructBadge(text,i){
		var badge = document.createElement('span'),
			x = document.createElement('span');
		
		badge.className = "badge badge-info pad-right-low";
	
		x.style.color = "white";
		x.style.cursor = "pointer";
	
		x.dataset.index = i;
	
		badge.appendChild(document.createTextNode(text));
		badge.appendChild(x);
		return badge;
	}

	function constructlisting(text,desc,i){
		var main = document.createElement('span'),
			tcon = document.createElement('span'),
			dcon = document.createElement('span'),
			check = document.createElement('div');

		main.style.clear = "both";
		
		tcon.style.textAlign = "left";
		tcon.style.pointerEvents = "none";
		
		dcon.style.float = "right";
		dcon.style.pointerEvents = "none";
		
		check.className = "check";
		
		tcon.appendChild(check);
		tcon.appendChild(document.createTextNode(text));
		
		dcon.appendChild(document.createTextNode(desc));

		main.appendChild(tcon);
		main.appendChild(dcon);

		main.dataset.index = i;
		
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