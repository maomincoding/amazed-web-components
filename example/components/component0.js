import { html } from 'https://cdn.jsdelivr.net/npm/strve-js/dist/strve.full-esm.js';
import {
    domInfo,
    onMounted,
    onUnmounted,
    defineComponent,
    reactive,
    ref,
    watchProps
} from '../../dist/strve-reactivity.esm.js';

export const MyComponent = defineComponent(() => {
    const state = reactive({
        text: 'hello',
    });
    const count = ref(0);

    const increase = () => {
        count.value++;
        console.log(domInfo.pref);
    };

    const onbuild = (e) => {
        console.log(e.detail);
    };

    return () => html`
          <fragment>
            <p onClick=${increase} class="msg" $ref="pref">${count.value}</p>
            <my-child msg=${state.text} onbuild=${onbuild}>
                <span slot="my-text">Let's have some different text!</span>
            </my-child>
          </fragment>
        `;
});

export const MyChild = defineComponent(
    {
        props: ['msg'],
        styles: [`.msg{color:red}`],
    },
    ({ props, content }) => {
        const state = reactive({ count: 0, msg: '' });
        const increase = () => {
            state.count++;
        };

        watchProps(() => {
            state.msg = props.msg;
        })

        onMounted(() => {
            console.log('child mounted');
        });

        onUnmounted(() => {
            console.log('child unmounted');
        });

        function newBuild() {
            content.emit('build', '1', '3');
        }

        return () => html`
            <fragment>
                <button onClick=${newBuild}>newBuild</button>
                <p><slot name="my-text">My default text</slot></p>
                <p class="msg">${state.msg}</p>
                <p>${state.count}</p>
                <button onClick=${increase}>increase</button>
            </fragment>
          `;
    }
);


