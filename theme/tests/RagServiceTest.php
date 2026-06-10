<?php

namespace Tests;

use Tests\TestCase;

class RagServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        require_once __DIR__ . '/../RagService.php';
    }

    public function testChunkTextStripsHtmlTags()
    {
        $text = '<p>Hello <strong>World</strong>!</p><p>This is a RAG test.</p>';
        $chunks = \RagService::chunkText($text, 10);
        
        $this->assertCount(1, $chunks);
        $this->assertEquals('Hello World!This is a RAG test.', $chunks[0]);
    }

    public function testChunkTextSplitsByWordCount()
    {
        $text = 'one two three four five six seven';
        $chunks = \RagService::chunkText($text, 3);
        
        $this->assertCount(3, $chunks);
        $this->assertEquals('one two three', $chunks[0]);
        $this->assertEquals('four five six', $chunks[1]);
        $this->assertEquals('seven', $chunks[2]);
    }

    public function testCosineSimilarityOrthogonal()
    {
        $v1 = [1.0, 0.0];
        $v2 = [0.0, 1.0];
        
        $similarity = \RagService::cosineSimilarity($v1, $v2);
        $this->assertEquals(0.0, $similarity);
    }

    public function testCosineSimilarityIdentical()
    {
        $v1 = [3.0, 4.0];
        $v2 = [3.0, 4.0];
        
        $similarity = \RagService::cosineSimilarity($v1, $v2);
        $this->assertEquals(1.0, $similarity, '', 0.0001);
    }

    public function testCosineSimilarityCollinear()
    {
        $v1 = [1.0, 2.0, 3.0];
        $v2 = [2.0, 4.0, 6.0];
        
        $similarity = \RagService::cosineSimilarity($v1, $v2);
        $this->assertEquals(1.0, $similarity, '', 0.0001);
    }

    public function testCosineSimilarityZeroVectors()
    {
        $v1 = [0.0, 0.0];
        $v2 = [1.0, 1.0];
        
        $similarity = \RagService::cosineSimilarity($v1, $v2);
        $this->assertEquals(0.0, $similarity);
    }
}
