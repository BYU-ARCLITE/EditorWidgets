(function(){
	if(typeof window.EditorWidgets !== 'object'){
		window.EditorWidgets = {};
	}

	/*	text, btnpos, icon, multiple, target,
		options, value, name, id, modal,
		defaultOption
	*/
	function SuperSelect(args){
		var that = this, open = false,
			text, icon, leftbtn, rightbtn, btnpos,
			target, parent, refnode, select, multiple,
			options, defOpt, tmpopts, value, modal,
			lastFilter = +(new Date),
			main = document.createElement('div'),
			rightbtn = document.createElement('button'),
			controls = document.createElement('div'),
			badgeHolder = document.createElement('span'),
			defBadge = document.createElement('span'),
			noSelection = document.createElement('span'),
			popup = document.createElement('div'),
			point = document.createElement('div'),
			filterbox = document.createElement('input'),
			filterdiv = document.createElement('div'),
			optionList = document.createElement('div');

		Object.defineProperties(this,{
			name: {
				get: function(){ return select.name; },
				set: function(n){ return select.name = n; }
			},
			id: {
				get: function(){ return select.id; },
				set: function(id){ return select.id = id; }
			},
			text: {
				get: function(){ return text; },
				set: function(t){
					text = t?""+t:"Select";
					var btn = leftbtn.childNodes[0];
					btn.replaceChild(document.createTextNode(text),btn.childNodes[1]);
					btn = rightbtn.childNodes[0];
					btn.replaceChild(document.createTextNode(text),btn.childNodes[1]);
				}
			},
			icon: {
				get: function(){ return icon; },
				set: function(i){
					icon = ""+i;
					leftbtn.childNodes[0].childNodes[0].className = icon;
					rightbtn.childNodes[0].childNodes[0].className = icon;
					return icon;
				}
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
			defaultOption: {
				get: function(){ return defOpt; },
				set: function(newdef){
					defOpt = typeof newdef === "object"?newdef:null;
					if(defOpt){
						defBadge.textContent = defOpt.text;
						noSelection.style.display = "none";
						if(value.length === 0){
							defBadge.style.display = "inline";
						}
					}else{
						defBadge.style.display = "none";
						if(value.length === 0){
							noSelection.style.display = "inline";
						}
					}
					return defOpt;
				}
			},
			open: {
				get: function(){ return open; },
				set: function(b){
					b = !!b;
					if(open === b){ return; }
					open = b;
					popup.style.display = open?"block":"none";

					if(open){
						resize();
						filterbox.focus();
					}

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
					o.badge.style.display = "inline";
					o.listing.classList.add("selected");

					if(!multiple){
						options.forEach(function(opt){
							if(opt !== o && opt.selected){
								opt.selected = false;
								opt.opt.selected = false;
								opt.badge.style.display = "none";
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
					o.badge.style.display = "none";
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
							badge.style.display = "inline;";
							listing.className = "option selected";
							max--;
						}else{
							opt.selected = false;
							badge.style.display = "none";
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

					badgeHolder.appendChild(defBadge);
					badgeHolder.appendChild(noSelection);

					options.forEach(function(o){
						select.appendChild(o.opt);
						badgeHolder.appendChild(o.badge);
						optionList.appendChild(o.listing);
					});
				}
			},
			value: {
				get: function(){
					return	value.length > 0?value.slice():
							defOpt?[defOpt.value]:[];
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

		main.style.display = "inline-block";
		main.style.position = "relative";

		target = (args.target||args.el);
		target = target instanceof Node?
			target:document.getElementById(target);
		if(!target){ throw new Error("Missing DOM Insertion Point for SuperSelect"); }
		if(target.nodeName === "SELECT"){
			select = target;
			parent = select.parentNode;
			refnode = select.nextSibling;
			multiple = select.multiple;
		}else{
			select = document.createElement('select');
			select.multiple = true;
			parent = target;
			refnode = null;
			multiple = !!args.multiple;
		}

		main.appendChild(select);

		select.style.display = "none";
		select.multiple = true;

		controls.className = "superselect";

		leftbtn = constructButton(this);
		rightbtn = constructButton(this);

		this.btnpos = args.btnpos;
		this.text = args.text;
		this.icon = args.icon;

		controls.appendChild(leftbtn);

		defBadge.className = "badge badge-info pad-right-low";
		noSelection.textContent = "Nothing selected";

		controls.appendChild(badgeHolder);

		controls.appendChild(rightbtn);

		main.appendChild(controls)

		main.addEventListener('click',selectHandler,false);


		popup.className = "superselectPopup";
		popup.classList.add(btnpos);
		popup.style.display = "none";

		point.className = "point";
		popup.appendChild(point);
		popup.appendChild(point.cloneNode());

		filterbox.className = "search-query";
		filterbox.type = "text";

		filterbox.addEventListener('change',filterOptions,false);
		filterbox.addEventListener('keyup',filterOptions,false);

		filterdiv.appendChild(filterbox);
		popup.appendChild(filterdiv);

		optionList.className = "optionListing";
		popup.appendChild(optionList);

		popup.addEventListener('click',selectHandler,false);

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
		this.defaultOption = args.defaultOption;

		if(typeof args.id === "string"){ this.id = args.id; }
		if(typeof args.name === "string"){ this.name = args.name; }

		if(typeof args.modal === "string"){
			modal = document.getElementById(args.modal);
		}else if(args.modal instanceof Node){
			modal = args.modal;
		}

		// Modals don't allow selection of input elements outside of modal
		(modal||document.body).appendChild(popup);

		parent.insertBefore(main, refnode);

		window.addEventListener("resize", function(){ if(open) resize(); }, false);
		window.addEventListener("click", function(){ that.open = false; }, false);
		document.addEventListener("keyup", function(e){
			if(e.keyCode === 27){ that.open = false; }
		},false);

		function updateValue(){
			value = options
					.filter(function(o){ return o.selected; })
					.map(function(o){ return o.value; });

			if(value.length === 0){
				(defOpt?defBadge:noSelection).style.display = "inline";
			}else{
				defBadge.style.display = "none";
				noSelection.style.display = "none";
			}
		}

		function filterOptions(){
			var that = this,
				time = +(new Date);
			if(time <= lastFilter){ return; }
			lastFilter = time + 100;
			setTimeout(function(){
				var filterstr = that.value.toLowerCase();
				options.forEach(function(o){
					var filtered =
						(o.text.toLowerCase().indexOf(filterstr) > -1) ||
						(o.desc.toLowerCase().indexOf(filterstr) > -1);
					if(o.filtered !== filtered){
						o.filtered = filtered;
						o.listing.style.display = filtered?"block":"none";
					}
				});
			},100);
		}

		function selectHandler(e){
			e.stopPropagation();
			e.preventDefault();
			if(e.target.dataset.hasOwnProperty("index")){
				that.toggle(+e.target.dataset.index);
				if(!multiple){ that.open = false; }
			}
		}

		function resize(){
			var bodyRect = document.body.getBoundingClientRect(),
				elemRect = (btnpos === "left"?leftbtn:rightbtn).getBoundingClientRect(),
				offsetTop = (elemRect.top + 45) - bodyRect.top,
				offsetLeft = elemRect.left - bodyRect.left;
			popup.style.top = offsetTop + "px";
			popup.style.left = offsetLeft + "px";
		}
	}

	function constructButton(ss){
		var main = document.createElement('div'),
			btn = document.createElement('button'),
			icon = document.createElement('div');

		btn.className = "btn";
		btn.appendChild(icon);
		btn.appendChild(document.createTextNode("Select"));
		main.appendChild(btn);

		btn.addEventListener('click',function(e){
			e.stopPropagation();
			e.preventDefault();
			ss.open = !ss.open;
		},false);

		return main;
	}

	function constructBadge(text,i){
		var badge = document.createElement('span'),
			x = document.createElement('span');

		badge.className = "badge badge-info pad-right-low";
		x.dataset.index = i;

		badge.appendChild(document.createTextNode(text));
		badge.appendChild(x);
		return badge;
	}

	function constructlisting(text,desc,i){
		var main = document.createElement('div'),
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

		dcon.appendChild(document.createTextNode(desc||""));

		main.appendChild(tcon);
		main.appendChild(dcon);

		main.dataset.index = i;

		return main;
	}

	EditorWidgets.SuperSelect = SuperSelect;

	if(window.Ractive){
		Ractive.components.SuperSelect = Ractive.extend({
			template: "<span></span>",
			onrender(){
				var ss = new SuperSelect({
					target: this.find('span'),
					modal: this.get("modal")
				});
				this.observe('options',function(opts){ ss.options = opts; });
				this.observe('defaultOption',function(dopt){ ss.defaultOption = dopt; });
				this.observe('multiple',function(m){ ss.multiple = m; });
				this.observe('value',function(v){ ss.value = v; });
				this.observe('text',function(t){ ss.text = t; });
				this.observe('icon',function(i){ ss.icon = i; });
			}
		});
	}
}());