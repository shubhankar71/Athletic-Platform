import torch
import torch.nn as nn

class BiLSTMAttentionClassifier(nn.Module):
    """
    Model C: BiLSTM with Self-Attention / Temporal Aggregation.
    Provides frame-level attention weights for temporal importance.
    Input shape: (batch_size, 30, 528)
    Output shape: (batch_size, 6)
    """
    def __init__(self, input_dim=528, hidden_dim=128, num_layers=2, num_classes=6, dropout=0.3):
        super(BiLSTMAttentionClassifier, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        
        self.attn_dense = nn.Linear(hidden_dim * 2, hidden_dim)
        self.attn_tanh = nn.Tanh()
        self.attn_v = nn.Linear(hidden_dim, 1, bias=False)
        
        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(64, num_classes)

    def forward(self, x, return_attention=False):
        lstm_out, _ = self.lstm(x) # (batch, 30, 256)

        u = self.attn_tanh(self.attn_dense(lstm_out)) # (batch, 30, 128)
        scores = self.attn_v(u).squeeze(-1) # (batch, 30)
        attn_weights = torch.softmax(scores, dim=1) # (batch, 30)

        context = torch.bmm(attn_weights.unsqueeze(1), lstm_out).squeeze(1) # (batch, 256)

        out = self.fc1(context)
        out = self.relu(out)
        out = self.dropout(out)
        logits = self.fc2(out) # (batch, 6)

        if return_attention:
            return logits, attn_weights
        return logits
