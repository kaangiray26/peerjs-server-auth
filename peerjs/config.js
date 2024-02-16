const options = {
    host: '0.0.0.0',
    port: 3000,
    path: '/peerjs',
    expire_timeout: 5000,
    alive_timeout: 6000,
    concurrent_limit: 5000,
    cleanup_out_msgs: 1000,
}

export default options;