#!/usr/bin/env node

'use strict';

require('./container')
    .build('app')
    .run();