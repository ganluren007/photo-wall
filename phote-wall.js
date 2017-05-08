window.onload = function() {
	var ul1 = document.getElementById("ul1");
	var ipt = document.getElementById("input1")
	var photo1 = new PhotoWall(ul1, ipt);
	photo1.init();
	photo1.sjpl()
}

//			创建一个照片墙的构造函数
function PhotoWall(wrap, ipt) {
	this.wrap = wrap;
	this.lis = this.wrap.getElementsByTagName("li");
	this.imgs = this.wrap.getElementsByTagName("img");
	this.ipt = ipt;
	this.zindex = 2;
	//				设置一个随即按钮的节流开关
	this.flag_btn = true;
	//				保存每张图片的left,top值
	this.arr = []
}

PhotoWall.prototype.init = function() {
	console.log(this.ipt)
	//				this.lis[0].animate({"left":10,"top":23},1000)
	//			    添加索引值
	for(var i = 0; i < this.lis.length; i++) {
		this.lis[i].index = i;
	}
	this.bjzh();
	//				不一定非要所有的方法都初始化运行,,选择性的调用也可以
	for(var i = 0; i < this.lis.length; i++) {
		this.drag(this.lis[i]);
	}

}

//          布局转化可以实现多个元素都需要绝对定位的时候,,先html写成float,在通过下面方法转化一下
PhotoWall.prototype.bjzh = function() {
	//				现获取每个元素的top和left位置值
	for(var i = 0; i < this.lis.length; i++) {

		this.arr.push([this.lis[i].offsetLeft, this.lis[i].offsetTop]);
	}
	for(var i = 0; i < this.arr.length; i++) {
		this.lis[i].style.position = "absolute"
		this.lis[i].style.left = this.arr[i][0] + "px"
		this.lis[i].style.top = this.arr[i][1] + "px"
		this.lis[i].style.margin = 0;
	}

}

//随机排序按钮		
PhotoWall.prototype.sjpl = function() {
	var temp = this;
	$(this.ipt).click(function() {
		//					添加一个节流阀
		if(temp.flag_btn) {
			temp.flag_btn = false;
			var arr1 = getDifMadom(0, temp.lis.length - 1);
			//					console.log(arr1)
			for(var i = 0; i < temp.lis.length; i++) {
				/*  for循环的速度比animate要快    
				  千万要注意当你jquery和原生混用的时候,出现不抱错的bug的时候,,一定要检查是不是原生元素用了jquery的方法
				  或者jquery元素用了原声的方法*/
				$(temp.lis[i]).animate({
					"left": temp.arr[arr1[i]][0],
					"top": temp.arr[arr1[i]][1]
				}, 500, function() {

					temp.flag_btn = true;
				})
				//						随机变化位置后要把索引处理一下
				temp.lis[i].index = arr1[i];
			}

		}

	})

}

PhotoWall.prototype.drag = function(obj) {
	var temp = this;
	obj.onmousedown = function(eve) {
		var temps = temp;
		var disX = eve.pageX - obj.offsetLeft;
		var disY = eve.pageY - obj.offsetTop;
		//					让拖拽的图片的层级永远最高
		obj.style.zIndex = temp.zindex++;
		document.onmousemove = function(eve) {
			obj.style.left = eve.pageX - disX + "px";
			obj.style.top = eve.pageY - disY + "px";

			for(var i = 0; i < temps.lis.length; i++) {
				temps.lis[i].style.border = ""
			}
						//						在鼠标移动的时候进行碰撞检测  并且在检测过程中返回距离最近的值
		   			   //						这里为挑选出最近距离的index参数

			var near = temps.getClost(obj);
			if(near) {
				near.style.border = "3px solid red";
			}
		}
		document.onmouseup = function() {

			document.onmousemove = null;
			document.onmouseup = null;
			var near = temps.getClost(obj);
			//						判断是否存在
			if(near) {
				near.style.zIndex = temp.zindex++;
				//							console.log(near)
				//							原生元素用jquery的方法要转换一下,,,搞半天
				$(near).animate({
					left: temps.arr[obj.index][0],
					top: temps.arr[obj.index][1]
				}, 500);
				$(obj).animate({
					left: temps.arr[near.index][0],
					top: temps.arr[near.index][1]
				}, 500);
				near.style.border = "";
				//                      	注意位置交换了,,索引也要交换
				var fl = 0;
				fl = near.index;
				near.index = obj.index;
				obj.index = fl;
			} else {
				$(obj).animate({
					left: temps.arr[obj.index][0],
					top: temps.arr[obj.index][1]
				}, 1000);
			}
		}
		//					 图片的拖拽要去消任事件
		return false;
	}
}
PhotoWall.prototype.getClost = function(obj) {
	var value = 99999;
	var index = -1;
	for(var i = 0; i < this.lis.length; i++) {
		//							碰撞检测两个对象是否碰撞
		if(pzjc(obj, this.lis[i]) && obj != this.lis[i]) {
			var lj = jl(obj, this.lis[i]);
			//								进行循环判断,获取最近距离的照片
			if(lj < value) {
				value = lj;
				index = i
			}
			//temp.lis[i].style.border = "3px solid red"
		}
	}
	//				写程序要严谨,,,是是考虑不存在的处理方法
	if(index != -1) {
		return this.lis[index]
	}

}

function getClost(obj) {

}
//          计算两个对象的距离
function jl(obj1, obj2) {
	var a = obj1.offsetLeft - obj2.offsetLeft;
	var b = obj1.offsetTop - obj2.offsetTop;
	return Math.sqrt(a * a + b * b);
}
//          判断两个对象是否碰撞,,,把方法细分不要一个方法实现的功能很多
function pzjc(obj1, obj2) {
	var L1 = obj1.offsetLeft;
	var R1 = obj1.offsetLeft + obj1.offsetWidth;
	var T1 = obj1.offsetTop;
	var B1 = obj1.offsetTop + obj1.offsetHeight;

	var L2 = obj2.offsetLeft;
	var R2 = obj2.offsetLeft + obj2.offsetWidth;
	var T2 = obj2.offsetTop;
	var B2 = obj2.offsetTop + obj2.offsetHeight;

	if(R1 < L2 || L1 > R2 || B1 < T2 || T1 > B2) {
		return false;
	} else {
		return true;
	}
}

function getDifMadom(min, max) {
	var arr = [];
	for(var i = min; i < max + 1; i++) {
		arr.push(i);
	}
	arr.sort(function(n1, n2) {
		return Math.random() - 0.5;
	});
	return arr;
}