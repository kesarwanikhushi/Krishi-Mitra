from rag.query import compute_confidence

def test_confidence():
    assert compute_confidence([0.8, 0.75], ['a','a']) == 'High'
    assert compute_confidence([0.6, 0.4], ['a','b']) == 'Medium'
    assert compute_confidence([0.3, 0.2], ['a','b']) == 'Low'
    assert compute_confidence([], []) == 'Low'
    print('All confidence scoring tests passed.')

if __name__ == '__main__':
    test_confidence()
