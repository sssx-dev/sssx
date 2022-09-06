import Header from '../../components/header.svelte';

const target = document.createElement('div');
const header = new Header({ target, hello: 'san francisco' });

document.insertBefore(document.body.firstChild!, target);
