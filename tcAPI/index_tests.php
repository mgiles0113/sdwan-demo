<?php

use PHPUnit\Framework\TestCase;

/**
 * @covers EthernetInterface
 */
final class EthernetInterfaceTest extends TestCase
{
    public function testAccessors() {
        $ec = new EthernetInterface();
        $ec->setName('testname');
        $this->assertEquals(
            'testname',
            $ec->getName()
        );    
    }
}