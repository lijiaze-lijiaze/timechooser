/** 主动触发页面的 resize 事件 */
const triggerResize = () => {
  if ( document.createEvent ) {
    const event = document.createEvent( 'HTMLEvents' );

    event.initEvent( 'resize', true, true );
    window.dispatchEvent( event );
  } else if ( document.createEventObject ) {
    const event = document.createEventObject();

    event.type = 'resize';
    document.body.fireEvent( 'onresize', event );
  }
};

/** 判断浏览器是否拥有 dom 2级事件 */
const isDomLevel2 = ( typeof window !== 'undefined' ) && !!window.addEventListener;

/**  为元素添加 dom 事件 */
const addEventListener = ( el, name, handler ) => {
//console.log('el', el, name, handler)
  if ( isDomLevel2 ) {
    el.addEventListener( name, handler );
  }
  else {
    el.attachEvent( `on${ name }`, handler );
  }
 // console.log('handler', handler)

  return handler;
};

/** 为元素删除 dom 事件 */
const removeEventListener = ( el, name, handler ) => {
  if ( isDomLevel2 ) {
    el.removeEventListener( name, handler );
  }
  else {
    el.detachEvent( `on${ name }`, handler );
  }
};

/**
 * DOM 元素监听 resize 事件
 * @param {*} el 元素 
 * @param {*} callback 事件
 */
const addDomResize = ( el, callback ) => {
  let oldWidth = el.offsetWidth;
  let oldHeight = el.offsetHeight;
  const timeout = () => {
    el.timer = setTimeout( () => {
      if ( typeof callback === 'function' && ( oldWidth !== el.offsetWidth || oldHeight !== el.offsetHeight ) ) {
        callback( { width: el.offsetWidth, height: el.offsetHeight, oldWidth, oldHeight } );
        oldWidth = el.offsetWidth;
        oldHeight = el.offsetHeight;
        timeout();

        return;
      }

      timeout();
    }, 100 );
  };

  timeout();
};

/**
 * DOM 元素移除 resize 事件
 * @param {*} el 元素 
 */
const removeDomResize = ( el ) => {
  clearTimeout( el.timer );
};

/**
 * 滚轮事件的兼容处理
 * @param {*} el 元素 
 * @param {*} callback 事件
 */
const addWheelEventListener = ( el, callback ) => {
  let wheelType = 'mousewheel';

  try {
    document.createEvent( 'MouseScrollEvents' );
    wheelType = 'DOMMouseScroll';
  } catch ( e ) { 
    // empty
  }

  addEventListener( el, wheelType, ( event ) => {
    
    // 统一为±120，其中正数表示为向上滚动，负数表示向下滚动
    if ( 'wheelDelta' in event ) {
      let delta = event.wheelDelta;
          
      // opera 9x系列的滚动方向与IE保持一致，10后修正
      

      // 由于事件对象的原有属性是只读，我们只能通过添加一个私有属性delta来解决兼容问题
      // 修正safari的浮点 bug
      event.delta = Math.round( delta ) / 120; 

    } else if ( 'detail' in event ) {
      // 为FF添加更大众化的wheelDelta
      event.wheelDelta = -event.detail * 40;  

      // 添加私有的delta
      event.delta = event.wheelDelta / 120; 
    }

    // 修正IE的this指向
    callback.call( el, event ); 
  } );
};

/**
 * 移除滚轮事件
 * @param {*} el 
 * @param {*} callback 
 */
const removeWheelEventListener = ( el, callback ) => {
  let wheelType = 'mousewheel';

  try {
    document.createEvent( 'MouseScrollEvents' );
    wheelType = 'DOMMouseScroll';
  } catch ( e ) {
    // empty
  }

  removeEventListener( el, wheelType, ( event ) => {
    // 修正IE的this指向
    callback.call( el, event );
  } );
};

/** 建立一个事件的唯一标识 id */
let eventsGuid = 0;

/**  建立一个 dom 事件处理队列 */
const Event = {
  add: ( elem, type, handle ) => {

    /**  事件的添加 */
    let elemData = null;
    let events = null;
    let eventHandle = null;

    if ( !elem.elemData ) {
      elem.elemData = {};
    }
    elemData = elem.elemData;
    if ( !elemData.events ) {
      elemData.events = {};
    }
    events = elemData.events;

    /**  为每个 dom 事件添加一个唯一标识 id */
    if ( !handle.guid ) { handle.guid = eventsGuid++; }

    /** 为每个 dom 添加一个统一的事件处理函数 */
    if ( !elemData.eventHandle ) {
      eventHandle = elemData.eventHandle = ( e ) => {
        const handles = elem.elemData.events[ e.type ];

        if ( !handles ) return;

        /**  事件队里的执行 */
        for ( const handle of handles ) {
          handle( e );
        }
      };
    } else if ( elemData.eventHandle ) {
      eventHandle = elemData.eventHandle;
    }

    if ( isDomLevel2 ) {
      elem.addEventListener( type, eventHandle );
    } else {
      elem.attachEvent( `on${ type }`, eventHandle );
    }

    if ( !events[ type ] ) {
      events[ type ] = [];
    }

    /**  将事件放入所对应类别的事件执行队列中 */
    events[ type ].push( handle );

  },
  remove: ( elem, type, handle ) => {
    /**  事件的移除 */
    let elemData = null;
    let events = null;
    let handles = null;
    let eventHandle = null;

    /**  对欲移除的事件做一个判断，判断该 dom 中是否拥有该事件 */
    if ( !elem.elemData ) {
      return;
    }
    elemData = elem.elemData;
    if ( !elem.elemData ) {
      return;
    }
    events = elemData.events;
    if ( !events[ type ] ) {
      return;
    }
    handles = events[ type ];
    let j = handles.length;

    /**  搜索事件队列，并移除指定事件 */
    while ( j-- ) {
      if ( !handle ) {
        handles.pop();
      } else if ( handles[ j ].guid === handle.guid && handles[ j ] === handle ) {
        handles.splice( j, 1 );
      }
    }

    /**  判断当前 dom 事件队列状态，如果队列为空。则移除相关队列 */
    if ( handles.length === 0 ) {
      delete events[ type ];
      if ( Object.keys( events ).length === 0 && elemData.eventHandle ) {
        eventHandle = elemData.eventHandle;
        if ( isDomLevel2 ) {
          elem.removeEventListener( type, eventHandle );
        } else {
          elem.detachEvent( `on${ type }`, eventHandle );
        }
      }
    }
  }
};

export { triggerResize, addEventListener, removeEventListener, isDomLevel2, Event, 
  addWheelEventListener, removeWheelEventListener, addDomResize, removeDomResize };
