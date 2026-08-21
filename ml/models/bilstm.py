import torch
import torch.nn as nn

class BiLSTMClassifier(nn.Module):
    """
    Model A: 2-Layer BiLSTM for temporal sequence classification.
    Input shape: (batch_size, 30, 528)
    Output shape: (batch_size, 6)
    """
    def __init__(self, input_dim=528, hidden_dim=128, num_layers=2, num_classes=6, dropout=0.3):
        super(BiLSTMClassifier, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(64, num_classes)

    def forward(self, x):
        lstm_out, _ = self.lstm(x) # (batch, 30, 256)
        out = torch.mean(lstm_out, dim=1) # (batch, 256)
        out = self.fc1(out)
        out = self.relu(out)
        out = self.dropout(out)
        logits = self.fc2(out) # (batch, 6)
        return logits
