import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App';

let workInpregressHook: any = null;
let isMounted = true;

let filber = {
  memoizedState: null as any,
  stateNode: App
};

const Dispatcher = (() => {
  function mountWorkInpregressHook() {
    const newHook = {
      memoizedState: null,
      queue: {
        pedding: null
      },
      next: null
    };

    if (filber.memoizedState === null) {
      filber.memoizedState = newHook;
    } else {
      workInpregressHook.next = newHook;
    }
    workInpregressHook = newHook;
    return workInpregressHook;
  }

  function updateWorkInpregressHook() {
    if (!workInpregressHook) {
      workInpregressHook = filber.memoizedState;
    } else {
      workInpregressHook = workInpregressHook.next;
    }
    return workInpregressHook;
  }
  function useState(initialState: any) {
    let hook: any;
    if (isMounted) {
      hook = mountWorkInpregressHook();
      hook.memoizedState = initialState;
    } else {
      hook = updateWorkInpregressHook();
    }

    let baseState = hook.memoizedState;
    let curQueue = hook.queue.pedding?.next;

    if (!isMounted) {
      do {
        baseState = curQueue?.action?.(baseState);
        curQueue = curQueue?.next;
      } while (curQueue !== hook.queue.pedding?.next);
    }

    return [baseState, dispatchAction.bind(null, hook)];
  }

  return { useState };
})();

function dispatchAction(hook: any, action: any) {
  const update: any = {
    action,
    next: null
  };

  if (!hook.queue.pedding) {
    update.next = update;
  } else {
    update.next = hook.queue.pedding.next;
    hook.queue.pedding.next = update;
  }

  hook.queue.pedding = update;
  isMounted = false;
  workInpregressHook = null;
  schedule();
}

function App() {
  const [count, setCount] = Dispatcher.useState(0);

  const [age, setAge] = Dispatcher.useState(10);

  return (
    <>
      <button onClick={() => setCount((prev: number) => prev + 1)}>add count</button>
      <p>count is: {count}</p>
      <button onClick={() => setAge((prev: number) => prev + 1)}>add age</button>
      <p>age is: {age}</p>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
function schedule() {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
schedule();
