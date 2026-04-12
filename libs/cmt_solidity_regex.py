# single_line_comment_pattern = r'//[/]?\s*(.*)'    # for single-line comments starting with '//' or '///'
single_line_comment_pattern = r'^\s*//[/]?\s*(.*)'    # for single-line comments starting with '//' or '///'
block_comment_pattern = r'/\*[\s\S]*?\*/'         # for block comments starting with '/*' and ending with '*/'
key_value_annotation_pattern = r'@(\w+):\s*(.*)'  # for annotations in the format of '@key: value'
leading_asterisk_pattern = r'^\s*\*\s*(.*)'       # for block comments with leading '*'

# Patterns specifically to detect dataset-added annotations (SmartBugs / SmartContractSecurity)
# 1) Block comment that contains @source or @vulnerable_at_lines
dataset_block_with_source_pattern = r'(?s)/\*.*?(?:@source:|@vulnerable_at_lines:).*?\*/'
# 2) Inline comment markers added by dataset like: // <yes> <report> VULN_NAME
dataset_inline_report_pattern = r'(?m)^[ \t]*//[ \t]*<yes>[ \t]*<report>.*$'

comment_patterns = [key_value_annotation_pattern, single_line_comment_pattern, block_comment_pattern, leading_asterisk_pattern]

__all__ = [
	'single_line_comment_pattern',
	'block_comment_pattern',
	'key_value_annotation_pattern',
	'leading_asterisk_pattern',
	'dataset_block_with_source_pattern',
	'dataset_inline_report_pattern',
]