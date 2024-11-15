import { registerComponent } from '../../dist/strve-reactivity.esm.js'
import { MyComponent, MyChild } from './component2.js'

// global registration
export default function register() {
    registerComponent(
        'my-child',
        MyChild
    );
    registerComponent(
        'my-component',
        MyComponent
    );

}